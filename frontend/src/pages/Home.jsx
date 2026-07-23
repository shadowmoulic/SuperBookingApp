import { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Sparkles, Loader2,
  ArrowRight, CheckCircle, MapPin, Search
} from "lucide-react";
import api from "../api/api";
import BookingCard from "../components/BookingCard";
import Loading from "../components/Loading";
import { HomeSkeleton } from "../components/SkeletonLoaders";
import { ErrorScreen } from "../components/ErrorScreen";
import LocationContext from "../context/LocationContext";
import ModalContext from "../context/ModalContext";
import TrailCard from "../components/TrailCard";
import LocationBentoCard from "../components/LocationBentoCard";

const HERO_SLIDES = [
  { image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=70", title: "Taj Mahal", location: "Agra, Uttar Pradesh" },
  { image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=70", title: "Amer Fort", location: "Jaipur, Rajasthan" },
  { image: "https://www.hampitrip.com/_next/image?url=https%3A%2F%2Fstorage.hampitrip.com%2Fhampitrip%2Fhampi%2Fhampi03.webp&w=1920&q=80", title: "Hampi Monuments", location: "Hampi, Karnataka" },
  { image: "https://www.oberoihotels.com/-/media/oberoi-hotel/kolkata_8-aug-24/destination/banner1920x980.jpg", title: "Victoria Memorial", location: "Kolkata, West Bengal" },
  { image: "https://s7ap1.scene7.com/is/image/incredibleindia/qutab-minar-delhi-attr-hero?qlt=82&ts=1742169673469", title: "Qutub Minar", location: "New Delhi, Delhi" },
  { image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/98/f7/df/charminar.jpg?w=1400&h=-1&s=1", title: "Charminar", location: "Hyderabad, Telangana" },
];

const CIRCUITS = [
  {
    title: "Golden Triangle", route: "Delhi  Agra  Jaipur", days: "4 Days",
    desc: "India's definitive introduction — Mughal grandeur, royal forts, and marble mausoleums.",
    image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=600&q=80",
    highlights: ["Taj Mahal at sunrise", "Red Fort barracks", "Amer Fort elephant walk"]
  },
  {
    title: "Rajasthan Royal Trail", route: "Jaipur  Jodhpur  Udaipur", days: "7 Days",
    desc: "Hilltop forts, shimmering palace lakes, and the living royalty of the desert state.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    highlights: ["Mehrangarh Fort", "Pichola Lake Palace", "Nahargarh sunset"]
  },
  {
    title: "Buddhist Circuit", route: "Bodh Gaya  Sarnath  Kushinagar", days: "5 Days",
    desc: "A spiritual journey through the most sacred sites in the story of the Buddha.",
    image: "https://www.peakadventuretour.com/assets/images/buddhist-circuit-banner.webp",
    highlights: ["Mahabodhi Temple", "Dhamek Stupa", "Deer Park Sarnath"]
  },
  {
    title: "Deccan Forts Route", route: "Hyderabad  Bijapur  Hampi", days: "6 Days",
    desc: "Rugged medieval citadels, Islamic domes, and the sprawling ruins of the Vijayanagara empire.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1DUuvc7zS8VXBVrbo9xdYmrO8MwRtRxPx0g&s",
    highlights: ["Golconda Fort acoustics", "Vittala Stone Chariot", "Gol Gumbaz echo"]
  },
  {
    title: "Temple Trail South", route: "Madurai  Thanjavur  Mahabalipuram", days: "6 Days",
    desc: "Soaring Gopurams, rock-cut cave temples and the greatest Dravidian architectural masterworks.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    highlights: ["Meenakshi Amman Temple", "Brihadeeswarar Temple", "Shore Temple"]
  },
];

const FALLBACK_ITINERARIES = {
  jaipur: {
    title: "Royal Jaipur Architectural Tour", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Heritage and Fortresses", activities: [
          { time: "09:00 AM", place: "Amer Fort", description: "Explore sandstone palaces, Sheesh Mahal mirror hall, and panoramic ramparts overlooking the lake.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "02:00 PM", place: "Nahargarh Fort", description: "Stand on the edge of the Aravalli hills with a breathtaking aerial view of the pink city.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80" },
          { time: "05:00 PM", place: "Jal Mahal", description: "Watch the floating palace glow at twilight from the Man Sagar Lake embankment.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Palaces and Observatories", activities: [
          { time: "09:30 AM", place: "Hawa Mahal", description: "Stand before the iconic 953-window facade designed for royal ladies to observe street festivals.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "City Palace", description: "Walk through royal courtyards, textile galleries, and the magnificent Peacock Gate.", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Jantar Mantar", description: "Marvel at the world's largest stone sundial and its extraordinary astronomical precision.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  delhi: {
    title: "Imperial Delhi Discovery", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Old Delhi Mughal Splendor", activities: [
          { time: "09:00 AM", place: "Red Fort", description: "Walk through the historic barracks and the Diwan-i-Aam public audience hall.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
          { time: "01:00 PM", place: "Jama Masjid", description: "Climb the minarets of India's largest mosque for sweeping views over Old Delhi.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
          { time: "04:30 PM", place: "Raj Ghat", description: "Pay respects at the peaceful Mahatma Gandhi memorial garden on the Yamuna banks.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "New Delhi Monuments", activities: [
          { time: "09:30 AM", place: "Qutub Minar", description: "See the towering 12th-century victory tower and surrounding archaeological park.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
          { time: "01:00 PM", place: "Humayun's Tomb", description: "Stroll through the lush garden tomb that inspired the architecture of the Taj Mahal.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
          { time: "04:00 PM", place: "India Gate", description: "Walk down Kartavya Path and admire the war memorial arch at golden hour.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  agra: {
    title: "Agra Mughal Heritage Trail", duration: "2 Days",
    days: [
      {
        day: 1, theme: "The Taj and Crafts", activities: [
          { time: "06:00 AM", place: "Taj Mahal", description: "Watch the marble dome catch the first light of sunrise — the most photographed moment in India.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
          { time: "11:00 AM", place: "Itmad-ud-Daulah", description: "Visit the Baby Taj — the first Mughal structure built entirely from marble with pietra dura inlay.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Kinari Bazaar", description: "Explore the old bazaar for marble handicrafts, leather goods, and Mughal-era jewellery.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Forts and Dynasties", activities: [
          { time: "09:30 AM", place: "Agra Fort", description: "Explore the walled Mughal city and royal residences built by Emperor Akbar in red sandstone.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
          { time: "02:00 PM", place: "Fatehpur Sikri", description: "Day-trip to Akbar's abandoned sandstone capital, including the towering Buland Darwaza.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  kolkata: {
    title: "Kolkata Cultural and Colonial Tour", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Colonial Grandeur", activities: [
          { time: "09:30 AM", place: "Victoria Memorial", description: "Marvel at the white marble monument and its extensive historical gallery collections.", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80" },
          { time: "01:30 PM", place: "Indian Museum", description: "Browse the oldest and largest museum in India, featuring antique collections and fossils.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj1GfiqmADT-Gjp57x5VqZbe_iK1Zes-gZAA&s" },
          { time: "04:30 PM", place: "Princep Ghat", description: "Enjoy a peaceful evening walk along the Hooghly River under the Vidyasagar Setu.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Literature and Science", activities: [
          { time: "09:00 AM", place: "Jorasanko Thakur Bari", description: "Tour the ancestral home and artistic legacy of Nobel laureate Rabindranath Tagore.", image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=400&q=80" },
          { time: "12:30 PM", place: "Science City", description: "Explore massive science galleries, space theater, and the evolution park.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
          { time: "04:00 PM", place: "Howrah Bridge", description: "Watch the iconic cantilever bridge during golden hour from the Hooghly ferry.", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  hyderabad: {
    title: "Nizams and Deccani Chronicles", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Charminar and Royal Palaces", activities: [
          { time: "09:00 AM", place: "Charminar", description: "Climb the monument at the center of the old city and explore Laad Bazaar for bangles.", image: "https://images.unsplash.com/photo-1627471900135-e110757d54b5?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "Chowmahalla Palace", description: "Walk through the grand court and restored palaces of the Nizam of Hyderabad.", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Salar Jung Museum", description: "See the remarkable collection of art, manuscripts, and the famous musical clock.", image: "https://images.unsplash.com/photo-1580537659444-230507d9d30c?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Fortresses and Ruins", activities: [
          { time: "09:30 AM", place: "Golconda Fort", description: "Climb the acoustic fort gates and hear the clapping echo system that warned of invaders.", image: "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=400&q=80" },
          { time: "02:30 PM", place: "Qutb Shahi Tombs", description: "Explore the domed mausoleums of the founding dynasty surrounded by tranquil gardens.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  hampi: {
    title: "Ruins of the Vijayanagara Empire", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Sacred Center and Temples", activities: [
          { time: "08:30 AM", place: "Virupaksha Temple", description: "Visit the ancient active temple dedicated to Lord Shiva near the Tungabhadra river bank.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
          { time: "11:00 AM", place: "Hemakuta Hill", description: "Climb the rocky hill to see early Jain and Shaiva temples and panoramic views.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
          { time: "03:30 PM", place: "Vittala Temple Complex", description: "See the iconic Stone Chariot and the resonant musical pillars of the main hall.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Royal Center Chronicles", activities: [
          { time: "09:00 AM", place: "Lotus Mahal and Elephant Stables", description: "Admire the Indo-Islamic pavilions and the symmetrical row of elephant chambers.", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "Hazara Rama Temple", description: "Examine the Ramayana narrative carvings covering the entire outer wall of the temple.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Matanga Hill", description: "Hike up the rocky trail to witness a spectacular sunset over the Hampi boulder ruins.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  varanasi: {
    title: "Spiritual Varanasi and Sarnath Walk", duration: "2 Days",
    days: [
      {
        day: 1, theme: "Ghats and Sacred Rituals", activities: [
          { time: "05:30 AM", place: "Assi Ghat Boat Ride", description: "Take a sunrise boat ride along the Ganges to witness early morning ritual bathing and prayers.", image: "https://images.unsplash.com/photo-1561361062-8567535fde36?auto=format&fit=crop&w=400&q=80" },
          { time: "10:30 AM", place: "Kashi Vishwanath Temple", description: "Visit the famous gold-plated jyotirlinga temple dedicated to Lord Shiva.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
          { time: "06:00 PM", place: "Dashashwamedh Ghat Aarti", description: "Witness the magnificent evening Ganga Aarti ceremony — one of the most moving spectacles in India.", image: "https://images.unsplash.com/photo-1561361062-8567535fde36?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Buddhist Sarnath Excursion", activities: [
          { time: "09:30 AM", place: "Sarnath Deer Park", description: "Visit the site where Buddha delivered his first sermon after attaining enlightenment.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "Dhamek Stupa", description: "Marvel at the massive stone stupa marking the exact spot of the Buddha's first discourse.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
          { time: "02:30 PM", place: "Sarnath Museum", description: "See the Lion Capital of Ashoka — India's national emblem — in its original display case.", image: "https://images.unsplash.com/photo-1580537659444-230507d9d30c?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
};

const WHY_ZEQUE = [
  { title: "Not Just Tickets", desc: "We map heritage trails, cultural context, and the right visiting sequence — not just a checkout button.", icon: "🗺" },
  { title: "AI-Curated Itineraries", desc: "Tell us your city, duration, and interests. Get a day-by-day plan that fits how you actually travel.", icon: "🧠" },
  { title: "Every Monument in Context", desc: "Timings, entry rules, nearby sites, and historical background — all in one place before you visit.", icon: "📖" },
  { title: "Built for Every Traveler", desc: "Families, students, photographers, history buffs, couples — the same platform works differently for everyone.", icon: "👥" },
];

const INTERESTS = ["History", "Architecture", "Photography", "Spiritual", "Family", "Adventure"];

const FALLBACK_IMAGE_EXP =
  "https://static.vecteezy.com/system/resources/thumbnails/000/140/923/small/india-gate-free-vector.jpg";
const FALLBACK_IMAGE_CITY =
  "https://img.magnific.com/free-vector/modern-skyline-building-background-design-with-reflection-effect_1017-50620.jpg?semt=ais_hybrid&w=740&q=80";
const FALLBACK_IMAGE_TRAIL =
  "https://media.istockphoto.com/id/2257224237/vector/flat-design-nature-landscape-with-winding-path.jpg?s=612x612&w=0&k=20&c=izv6B-Ndq-hQNBgiBwguMxC1IfjbsrxFsfxo1vpeZzo="

function SmallExperienceCard({ experience }) {
  const slug = experience.name ? experience.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : experience.public_id;
  const images = String(experience.image_url || FALLBACK_IMAGE_EXP)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const coverImage = images[0] || FALLBACK_IMAGE_EXP;

  return (
    <Link to={`/attraction/${slug}`} className="block h-full group">
      <div className="bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl border border-outline-variant/30 flex flex-col h-full overflow-hidden transition-all duration-300 relative">
        {/* Image Container */}
        <div className="relative w-full h-[75%] overflow-hidden flex-shrink-0">
          <img
            src={coverImage}
            alt={experience.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.src = FALLBACK_IMAGE_EXP; }}
          />
          {/* Absolute Price Tag */}
          {/* <div className="absolute top-4 right-4 bg-surface-container-lowest/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/30">
            <span className="font-['JetBrains_Mono'] text-sm font-bold text-on-surface">
              ₹{Number(experience.entry_fee_base).toFixed(2)}
            </span>
          </div> */}
        </div>


        {/* Book Tickets Outline Button */}
        {/* <div className="mt-auto w-full">
            <div className="w-full py-2.5 rounded-lg border-2 border-primary text-primary font-['Hanken_Grotesk'] font-semibold text-sm transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary flex items-center justify-center gap-1.5 active:scale-98">
              Book Tickets
              <ArrowRight className="stroke-[3]" />
              </div>
          </div> */}
        {/* Card Body */}
        <div className="px-3 py-2 flex-1 flex h-[20%] items-center justify-between">
          <div className="">
            {/* Name Title */}
            <h3 className="font-['Hanken_Grotesk'] font-bold text-s text-on-surface leading-snug mb-1 group-hover:text-primary transition-colors">
              {experience.name}
            </h3>
            {/* City Tag */}
            <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant font-['Inter'] block mb-1">
              {experience.city}
            </span>
          </div>
          <div className="bg-surface-container-lowest/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/30">
            <span className="font text-sm font-bold text-on-surface">
              ₹{Number(experience.entry_fee_base)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryGridCard({ category }) {
  const catSlug = category.name.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
  return (
    <Link to={`/category/${catSlug}`} className="block group">
      <div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col items-center justify-center border border-outline-variant/30 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer h-36">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-all">
          {category.icon_url ? (
            <img
              src={category.icon_url}
              alt={category.name}
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <span className="material-symbols-outlined text-2xl text-primary">
              category
            </span>
          )}
        </div>
        <span className="font-['Hanken_Grotesk'] text-sm font-semibold text-on-surface text-center line-clamp-1">
          {category.name}
        </span>
      </div>
    </Link>
  );
}

function Home() {
  const navigate = useNavigate();
  const { selectedLocation, coords } = useContext(LocationContext);
  const { openSearch } = useContext(ModalContext);

  // Hero Carousel (from DemoHome Section 1)
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const continueBookingRef = useRef(null);
  const categoriesRef = useRef(null);
  const locationsRef = useRef(null);
  const featuredCatsRefs = useRef([]);
  const circuitsRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollFeaturedCat = (index, direction) => {
    const ref = featuredCatsRefs.current[index];
    if (ref) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // AI Planner States & Handlers
  const [plannerCity, setPlannerCity] = useState("jaipur");
  const [plannerDuration, setPlannerDuration] = useState("2");
  const [plannerInterests, setPlannerInterests] = useState(["History", "Architecture"]);
  const [itinerary, setItinerary] = useState(FALLBACK_ITINERARIES["jaipur"]);
  const [plannerLoading, setPlannerLoading] = useState(false);

  const toggleInterest = (interestName) => {
    setPlannerInterests((prev) =>
      prev.includes(interestName)
        ? prev.filter((item) => item !== interestName)
        : [...prev, interestName]
    );
  };

  const handleGenerate = async () => {
    setPlannerLoading(true);
    const prompt = `Generate a high-fidelity travel itinerary for a ${plannerDuration}-day trip to ${plannerCity.toUpperCase()}. Focus on interests: ${plannerInterests.join(", ")}. Return only raw JSON (no markdown blocks). Match this format exactly: {"title":"...","duration":"...","days":[{"day":1,"theme":"Day theme","activities":[{"time":"Time slot","place":"Monument Name","description":"Short overview","image":"https://images.unsplash.com/..."}]}]}`;
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are an expert Indian heritage tour curator. Output raw JSON only. No emojis, no markdown. Professional, clean tone." },
            { role: "user", content: prompt }
          ],
          temperature: 0.4, max_tokens: 1000, response_format: { type: "json_object" }
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      if (parsed?.days) setItinerary(parsed);
      else throw new Error("Invalid format");
    } catch (err) {
      console.warn("AI generation failed, falling back to local curation.", err);
      setItinerary(FALLBACK_ITINERARIES[plannerCity.toLowerCase()] || FALLBACK_ITINERARIES["jaipur"]);
    } finally {
      setPlannerLoading(false);
    }
  };

  const [isStickyActive, setIsStickyActive] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const browseSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;

      // Determine if navbar is visible
      if (currentScrollY <= 80) {
        setIsNavbarVisible(true);
      } else if (diff > 10) {
        setIsNavbarVisible(false);
      } else if (diff < -10) {
        setIsNavbarVisible(true);
      }
      lastScrollYRef.current = currentScrollY;

      // Check browse section position relative to screen
      if (browseSectionRef.current) {
        const rect = browseSectionRef.current.getBoundingClientRect();
        // Activated when bottom of browse section is scrolled past the navbar height (approx 72px)
        if (rect.bottom < 72) {
          setIsStickyActive(true);
        } else {
          setIsStickyActive(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [currentPage, coords]);

  const fetchHomeData = () => {
    setLoading(true);
    let url = `/api/home/?${currentPage}`;
    if (coords) {
      url += `&latitude=${coords.latitude}&longitude=${coords.longitude}`;
    }
    api
      .get(url)
      .then((res) => {
        setHomeData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching home data:", err);
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <HomeSkeleton />;
  if (error) {
    return <ErrorScreen message={error} onRetry={fetchHomeData} />;
  }
  if (!homeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-['Inter'] text-center px-6">
        <span className="material-symbols-outlined text-4xl mb-3 text-gray-300 select-none">sentiment_dissatisfied</span>
        <p className="text-sm font-semibold">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen w-full relative">
      <div className="mx-auto py-16 w-full relative">
        {/* Sticky Categories Sub-Header */}
        {homeData && homeData.all_categories && (
          <div
            className={`fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs transition-all duration-300 ease-in-out ${isStickyActive
              ? `opacity-100 pointer-events-auto ${isNavbarVisible ? "translate-y-[73px]" : "translate-y-0"}`
              : "-translate-y-full opacity-0 pointer-events-none"
              }`}
          >
            <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {homeData.all_categories.map((category) => {
                const catSlug = category.name.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
                return (
                  <Link
                    key={category.id}
                    to={`/${selectedLocation.toLowerCase().replace(/\s+/g, '-')}/${catSlug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all text-sm font-semibold text-on-surface-variant whitespace-nowrap flex-shrink-0 group shadow-2xs"
                  >
                    {category.icon_url ? (
                      <img
                        src={category.icon_url}
                        alt={category.name}
                        className="w-5 h-5 object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-lg text-primary">
                        category
                      </span>
                    )}
                    <span className="font-['Hanken_Grotesk']">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION 1: HERO ───────────────────────────────── */}
        <section className="relative w-full h-[88vh] min-h-[560px] flex items-center overflow-hidden">
          {/* Background slides */}
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
              <img
                src={slide.image}
                alt={slide.title || "Hero Slide Banner"}
                className="w-full h-full object-cover"
                fetchPriority={i === 0 ? "high" : "low"}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20" />
            </div>
          ))}

          {/* Slide nav dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i} onClick={() => setCurrentSlide(i)}
                className="h-12 w-8 flex items-center justify-center cursor-pointer group"
                aria-label={`Slide ${i + 1}`}
              >
                <span className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-7 bg-amber-400" : "w-2 bg-white/40 group-hover:bg-white/70"}`} />
              </button>
            ))}
          </div>

          {/* Location badge */}
          <div className="absolute bottom-8 right-6 z-20 hidden sm:block text-right">
            <p className="text-amber-400 font-bold text-sm">{HERO_SLIDES[currentSlide].title}</p>
            <p className="text-slate-300 text-xs">{HERO_SLIDES[currentSlide].location}</p>
          </div>

          {/* Hero copy and search */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8">
            <p className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">India's Heritage Discovery Platform</p>

            <h1 className="text-[1.65rem] leading-tight sm:text-5xl lg:text-7xl font-black text-white sm:leading-[1.05] tracking-tight mb-4">
              Don't Just Visit India.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Understand It.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl font-light mb-10 max-w-xl leading-relaxed">
              Explore 100+ monuments, heritage trails and historic cities.
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl" onClick={() => openSearch()}>
              <div className="flex items-center bg-surface-container rounded-2xl shadow-2xl transition-all duration-200 hover:ring-2 hover:ring-primary/20 cursor-pointer">
                <div className="pl-5 pr-2 text-on-surface-variant">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Where are you going?"
                  className="flex-1 bg-transparent border-none text-on-surface focus:outline-none placeholder-on-surface-variant/60 text-sm sm:text-base py-4 pr-4 cursor-pointer"
                />
                <button className="m-2 bg-primary hover:bg-opacity-95 text-on-primary font-bold px-5 sm:px-7 py-3 rounded-xl text-sm shrink-0 cursor-pointer">
                  Explore
                </button>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-on-surface-variant text-xs font-semibold">Trending:</span>
              {["Taj Mahal", "Amer Fort", "Varanasi Ghats", "Hampi"].map((chip) => (
                <button
                  key={chip}
                  onClick={(e) => {
                    e.stopPropagation();
                    openSearch(chip);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-sm transition-all duration-150 hover:scale-105 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: TRUST BAR ─────────────────────────── */}
        <section className="bg-surface-container-lowest border-b border-outline-variant/30 py-6">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
              {[["100+", "Heritage Sites"], ["100+", "Cities Mapped"], ["20+", "UNESCO Landmarks"], ["5", "Curated Trails"]].map(([num, label]) => (
                <div key={label} className="py-4 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                  <p className="text-2xl sm:text-3xl font-black text-primary">{num}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main constrained container for Bookings, Categories, Locations */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8">

          {/* Continue Booking */}
          {homeData.continue_booking &&
            Object.keys(homeData.continue_booking).length > 0 && (
              <section className="continue-booking-section mb-16 animate-fade-in">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="font-['Hanken_Grotesk'] text-2xl sm:text-3xl font-bold text-primary mb-2">
                      Continue Booking
                    </h2>
                    <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                      Pick up where you left your booking journey
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollContainer(continueBookingRef, 'left')}
                      className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scrollContainer(continueBookingRef, 'right')}
                      className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div ref={continueBookingRef} className="flex overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory no-scrollbar">
                    {Array.isArray(homeData.continue_booking) ? (
                      homeData.continue_booking.map((booking) => (
                        <div key={booking.id} className="w-[300px] sm:w-[340px] shrink-0 snap-start">
                          <BookingCard booking={booking} />
                        </div>
                      ))
                    ) : (
                      <p className="font-['Inter'] text-sm text-gray-500">No pending bookings</p>
                    )}
                  </div>
                </div>
              </section>

            )}

          {/* Browse by Categories */}
          {homeData.all_categories && (
            <section ref={browseSectionRef} className="all-categories-section mb-16">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                    Browse by Categories
                  </h2>
                  <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                    Select a category to filter experiences
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollContainer(categoriesRef, 'left')}
                    className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollContainer(categoriesRef, 'right')}
                    className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div ref={categoriesRef} className="flex overflow-x-auto pb-4 gap-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
                  {homeData.all_categories.map((category) => (
                    <div key={category.id} className="w-[120px] sm:w-[150px] shrink-0 snap-start">
                      <CategoryGridCard category={category} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

          )}

          {/* Explore Locations */}
          {homeData.explore_locations && (
            <section className="explore-locations-section mb-16">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                    {homeData.explore_locations.label}
                  </h2>
                  <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                    Discover cultural hubs across the subcontinent
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollContainer(locationsRef, 'left')}
                      className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scrollContainer(locationsRef, 'right')}
                      className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <Link to="/cities" className="text-primary font-['Hanken_Grotesk'] font-semibold flex items-center gap-1.5 hover:underline text-sm active:scale-95 transition-all">
                    View All <ArrowRight className="stroke-[3]" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div ref={locationsRef} className="flex overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory no-scrollbar">
                  {homeData.explore_locations.data.map((location) => (
                    <div key={location.public_id} className="w-[280px] shrink-0 snap-start">
                      <LocationBentoCard location={location} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

          )}

          {/* Featured Categories */}
          {homeData.featured_categories &&
            homeData.featured_categories.map((category, catIdx) => {
              const categorySlug = category.category.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
              return (
                <section
                  className="museum-section mb-16"
                  key={category.category + category.pagination.current_page}
                >
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                        {category.category}
                      </h2>
                      <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                        Discover unique experiences and guided tours in this category
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => scrollFeaturedCat(catIdx, 'left')}
                          className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                          aria-label="Scroll left"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => scrollFeaturedCat(catIdx, 'right')}
                          className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                          aria-label="Scroll right"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <Link
                        to={`/${selectedLocation.toLowerCase().replace(/\s+/g, '-')}/${categorySlug}`}
                        className="text-primary font-['Hanken_Grotesk'] font-semibold flex items-center gap-1.5 hover:underline text-sm active:scale-95 transition-all"
                      >
                        View All <ArrowRight className="stroke-[3]" />
                      </Link>
                    </div>
                  </div>

                  <div className="relative">
                    <div ref={el => featuredCatsRefs.current[catIdx] = el} className="flex overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory no-scrollbar">
                      {category.experiences.map((exp) => (
                        <div key={exp.id} className="w-[200px] sm:w-[200px] h-[360px] shrink-0 snap-start">
                          <SmallExperienceCard experience={exp} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

        </div>

        {/* Famous Heritage Circuits */}
        <section id="trails" className="py-16 border-t border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
              <div>
                <span className="font-['Hanken_Grotesk'] text-xs font-bold text-on-surface uppercase tracking-widest">Curated Routes</span>
                <h2 className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl font-bold text-primary tracking-tight mt-1.5">Famous Heritage Circuits</h2>
                <p className="font-['Inter'] text-on-surface-variant text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                  Follow historic pathways etched by dynasties. Each circuit is a complete journey, not just a list.
                </p>
              </div>
              <div className="flex gap-2 self-end mt-4 md:mt-0">
                <button
                  onClick={() => scrollContainer(circuitsRef, 'left')}
                  className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollContainer(circuitsRef, 'right')}
                  className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center text-on-surface bg-surface-container-lowest"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div ref={circuitsRef} className="flex overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory no-scrollbar">
                {(homeData.featured_trails && homeData.featured_trails.length > 0 ? homeData.featured_trails : CIRCUITS).map((c) => (
                  <div key={c.name || c.title} className="w-[280px] sm:w-[360px] shrink-0 snap-start">
                    <TrailCard trail={c} />
                  </div>
                ))}
              </div>
            </div>


            <div className="text-center mt-10">
              <Link to="/trails" className="inline-flex items-center gap-2 border-2 border-on-surface hover:bg-on-surface hover:text-surface-container-lowest text-on-surface font-['Hanken_Grotesk'] font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200">
                View All Heritage Trails <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>


        {/* AI Planner */}
        <section id="planner" className="py-16 bg-surface-container-low border-y border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="text-center mb-10 sm:mb-14">
              <span className="font-['Hanken_Grotesk'] text-xs font-bold text-on-surface uppercase tracking-widest">AI-Powered</span>
              <h2 className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl font-bold text-primary tracking-tight mt-1.5">Plan Your Journey in 30 Seconds</h2>
              <p className="font-['Inter'] text-on-surface-variant text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
                Tell us your destination, how long you're staying, and what you love. We'll build the day.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left: form */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-6 sm:p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-['Hanken_Grotesk'] text-xs font-bold text-primary uppercase tracking-wider">AI Travel Guide</p>
                    <h3 className="font-['Hanken_Grotesk'] text-on-surface font-bold text-lg">Your preferences</h3>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* City */}
                  <div>
                    <label htmlFor="home-planner-city" className="block font-['Inter'] text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Destination</label>
                    <select
                      id="home-planner-city"
                      value={plannerCity}
                      onChange={(e) => { const c = e.target.value; setPlannerCity(c); setItinerary(FALLBACK_ITINERARIES[c]); }}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-['Inter'] cursor-pointer"
                    >
                      <option value="jaipur">Jaipur — Pink City</option>
                      <option value="delhi">Delhi — Historic Capital</option>
                      <option value="agra">Agra — Mughal Capital</option>
                      <option value="kolkata">Kolkata — Cultural Center</option>
                      <option value="hyderabad">Hyderabad — Nizam City</option>
                      <option value="hampi">Hampi — Vijayanagara Empire</option>
                      <option value="varanasi">Varanasi — Spiritual Capital</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block font-['Inter'] text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Trip Duration</label>
                    <div className="grid grid-cols-5 gap-2 font-['Inter']">
                      {["1", "2", "3", "4", "5"].map((d) => (
                        <button key={d} onClick={() => setPlannerDuration(d)}
                          className={`py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${plannerDuration === d ? "bg-primary border-primary text-on-primary" : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}>
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block font-['Inter'] text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Travel Interests</label>
                    <div className="grid grid-cols-2 gap-2 font-['Inter']">
                      {INTERESTS.map((interest) => {
                        const sel = plannerInterests.includes(interest);
                        return (
                          <button key={interest} onClick={() => toggleInterest(interest)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${sel ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}>
                            {interest}
                            <span className={`w-2 h-2 rounded-full ${sel ? "bg-primary" : "bg-outline-variant"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate */}
                  <button onClick={handleGenerate} disabled={plannerLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-95 disabled:bg-outline-variant/50 text-on-primary font-['Hanken_Grotesk'] font-bold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-95 cursor-pointer">
                    {plannerLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating plan...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate My Itinerary</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: itinerary with photos */}
              <div className="lg:col-span-8">
                {itinerary && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-tertiary/20 bg-tertiary/10 px-4 py-4 shadow-sm">
                      <div>
                        <p className="font-['Hanken_Grotesk'] text-xs font-bold text-tertiary uppercase tracking-widest">Your Itinerary</p>
                        <h3 className="font-['Hanken_Grotesk'] text-tertiary font-extrabold text-2xl mt-1">{itinerary.title}</h3>
                      </div>
                      <span className="self-start bg-tertiary text-on-tertiary text-xs font-['Hanken_Grotesk'] font-bold px-3.5 py-1.5 rounded-full shadow-xs">
                        {itinerary.duration}
                      </span>
                    </div>


                    {itinerary.days.map((dayData, di) => (
                      <div key={di} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
                        <div className="px-5 py-3.5 border-b border-outline-variant flex items-center gap-3 bg-surface-container-low">
                          <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-['JetBrains_Mono'] font-bold flex items-center justify-center">{dayData.day}</span>
                          <span className="font-['Hanken_Grotesk'] text-on-surface font-semibold text-sm">{dayData.theme}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-outline-variant">
                          {dayData.activities.map((act, ai) => (
                            <div key={ai} className="group">
                              {act.image && (
                                <div className="h-28 overflow-hidden">
                                  <img src={act.image} alt={act.place} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95" />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <p className="font-['Hanken_Grotesk'] text-on-surface font-bold text-sm truncate">{act.place}</p>
                                  <span className="font-['JetBrains_Mono'] text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded shrink-0">{act.time}</span>
                                </div>
                                <p className="font-['Inter'] text-on-surface-variant text-xs leading-relaxed">{act.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="text-center">
                      <button className="inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-on-primary font-['Hanken_Grotesk'] font-bold px-7 py-3 rounded-full text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer">
                        Plan My Full Journey <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why Travelers Choose ZeQue */}
        <section className="py-16">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="text-center mb-10 sm:mb-14">
              <span className="font-['Hanken_Grotesk'] text-xs font-bold text-primary uppercase tracking-widest">Our Difference</span>
              <h2 className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1.5">Why Travelers Choose ZeQue</h2>
              <p className="font-['Inter'] text-on-surface-variant text-sm sm:text-base mt-2 max-w-xl mx-auto">
                Headout has tickets. TripAdvisor has reviews. Google has locations. We have all three — plus the context to make sense of it.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {WHY_ZEQUE.map((w) => (
                <div key={w.title} className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 sm:p-7 hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
                  <div className="text-3xl mb-4">{w.icon}</div>
                  <h3 className="font-['Hanken_Grotesk'] font-bold text-on-surface text-base mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
                  <p className="font-['Inter'] text-on-surface-variant text-sm leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a href="#" className="inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-on-primary font-['Hanken_Grotesk'] font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Find Places Near Me <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
