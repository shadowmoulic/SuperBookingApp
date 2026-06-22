import { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, ChevronRight, Compass, Loader2,
  Clock, Users, Star, ArrowRight, CheckCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const HERO_SLIDES = [
  { image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=70", title: "Taj Mahal", location: "Agra, Uttar Pradesh" },
  { image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=70", title: "Amer Fort", location: "Jaipur, Rajasthan" },
  { image: "https://www.hampitrip.com/_next/image?url=https%3A%2F%2Fstorage.hampitrip.com%2Fhampitrip%2Fhampi%2Fhampi03.webp&w=1920&q=80", title: "Hampi Monuments", location: "Hampi, Karnataka" },
  { image: "https://www.oberoihotels.com/-/media/oberoi-hotel/kolkata_8-aug-24/destination/banner1920x980.jpg", title: "Victoria Memorial", location: "Kolkata, West Bengal" },
  { image: "https://s7ap1.scene7.com/is/image/incredibleindia/qutab-minar-delhi-attr-hero?qlt=82&ts=1742169673469", title: "Qutub Minar", location: "New Delhi, Delhi" },
  { image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/98/f7/df/charminar.jpg?w=1400&h=-1&s=1", title: "Charminar", location: "Hyderabad, Telangana" },
];

const CITIES = [
  {
    name: "Delhi", image: "https://www.mistay.in/travel-blog/content/images/size/w2000/2020/06/cover-10.jpg",
    season: "Oct – Mar", stats: [{ label: "Heritage Sites", value: "24+" }, { label: "Monuments", value: "174" }, { label: "Museums", value: "40+" }]
  },
  {
    name: "Agra", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    season: "Nov – Feb", stats: [{ label: "Attractions", value: "8+" }, { label: "UNESCO Sites", value: "3" }, { label: "Mughal Sites", value: "6" }]
  },
  {
    name: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    season: "Oct – Mar", stats: [{ label: "Attractions", value: "34+" }, { label: "Forts", value: "12" }, { label: "UNESCO Sites", value: "3" }]
  },
  {
    name: "Kolkata", image: "https://www.oberoihotels.com/-/media/oberoi-hotel/kolkata_8-aug-24/destination/banner1920x980.jpg",
    season: "Oct – Feb", stats: [{ label: "Heritage Sites", value: "28+" }, { label: "Museums", value: "9" }, { label: "Colonial Trails", value: "4" }]
  },
  {
    name: "Hyderabad", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/98/f7/df/charminar.jpg?w=1400&h=-1&s=1",
    season: "Nov – Feb", stats: [{ label: "Attractions", value: "12+" }, { label: "Nizam Palaces", value: "7" }, { label: "Museums", value: "8" }]
  },
  {
    name: "Mumbai", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
    season: "Oct – Mar", stats: [{ label: "Attractions", value: "14+" }, { label: "Colonial Sites", value: "8" }, { label: "Art Galleries", value: "12" }]
  },
  {
    name: "Udaipur", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=600&q=80",
    season: "Sep – Mar", stats: [{ label: "Attractions", value: "10+" }, { label: "Palaces", value: "6" }, { label: "Lake Views", value: "4" }]
  },
  {
    name: "Varanasi", image: "https://theorionhotels.com/_next/image?url=https%3A%2F%2Fassets.theasar.com%2Fblogs%2F1768561498185_top_10_places_to_visit_in_varanasi.webp&w=3840&q=75",
    season: "Oct – Mar", stats: [{ label: "Ghats", value: "84" }, { label: "Temples", value: "23,000+" }, { label: "Spiritual Sites", value: "14" }]
  },
  {
    name: "Mysore", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    season: "Oct – Mar", stats: [{ label: "Attractions", value: "7+" }, { label: "Palaces", value: "3" }, { label: "Heritage Sites", value: "9" }]
  },
  {
    name: "Hampi", image: "https://www.hampitrip.com/_next/image?url=https%3A%2F%2Fstorage.hampitrip.com%2Fhampitrip%2Fhampi%2Fhampi03.webp&w=1920&q=80",
    season: "Oct – Feb", stats: [{ label: "Ruins", value: "100+" }, { label: "UNESCO Sites", value: "1" }, { label: "Temple Complexes", value: "11" }]
  },
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

const CATEGORIES = [
  { name: "UNESCO World Heritage", count: "42 Sites", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80" },
  { name: "Royal Palaces", count: "28 Palaces", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=600&q=80" },
  { name: "Historic Forts", count: "75+ Forts", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80" },
  { name: "Museums", count: "120+ Museums", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj1GfiqmADT-Gjp57x5VqZbe_iK1Zes-gZAA&s" },
  { name: "Ancient Temples", count: "250+ Temples", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
  { name: "Colonial Architecture", count: "35 Sites", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80" },
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

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function DemoHome() {
  const navigate = useNavigate();

  // Hero Carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const [dates, setDates] = useState("Add dates");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [travelersPickerOpen, setTravelersPickerOpen] = useState(false);
  const searchRef = useRef(null);
  const QUICK_CHIPS = ["Jaipur Forts", "Delhi Heritage Walk", "Temples in Varanasi", "Hampi Ruins", "UNESCO Sites"];
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // AI Planner
  const [plannerCity, setPlannerCity] = useState("jaipur");
  const [plannerDuration, setPlannerDuration] = useState("2");
  const [plannerInterests, setPlannerInterests] = useState(["History", "Architecture"]);
  const [itinerary, setItinerary] = useState(FALLBACK_ITINERARIES["jaipur"]);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const INTERESTS = ["History", "Architecture", "Photography", "Spiritual", "Family", "Adventure"];

  const toggleInterest = (i) => setPlannerInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

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
    } catch {
      setItinerary(FALLBACK_ITINERARIES[plannerCity.toLowerCase()] || FALLBACK_ITINERARIES["jaipur"]);
    } finally {
      setPlannerLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen overflow-x-hidden w-full">

      {/* ── SECTION 1: HERO ───────────────────────────────── */}
      <section className="relative w-full h-[88vh] min-h-[560px] flex items-center overflow-hidden">

        {/* Background slides */}
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <img
              src={slide.image}
              alt={slide.title || "Hero Slide Banner"}
              className="w-full h-full object-cover"
              fetchpriority={i === 0 ? "high" : "low"}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20" />
          </div>
        ))}

        {/* Slide nav dots */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
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
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-9 sm:pt-0 pb-12 sm:pb-0">
          <p className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">India's Heritage Discovery Platform</p>

          <h1 className="text-[1.65rem] leading-tight sm:text-5xl lg:text-7xl font-black text-white sm:leading-[1.05] tracking-tight mb-4">
            Don't Just Visit India.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Understand It.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl font-light mb-10 max-w-xl leading-relaxed">
            Explore 1500+ monuments, heritage trails and historic cities.
          </p>

          {/* Search bar */}
          <div ref={searchRef} className="relative max-w-4xl z-30">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 flex items-center px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <MapPin className="w-5 h-5 text-slate-400 mr-3 group-hover:text-[#136b55] transition-colors" />
                <div className="text-left w-full">
                  <label htmlFor="demo-home-where-to" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Where to?</label>
                  <select
                    id="demo-home-where-to"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none p-0 focus:ring-0 font-semibold text-slate-800 w-full cursor-pointer text-sm outline-none"
                  >
                    <option value="">Select State</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Goa">Goa</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
              </div>

              <div className="w-px bg-slate-100 hidden md:block my-2"></div>

              <div
                className="flex-1 flex items-center px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group relative"
                onClick={() => { setDatePickerOpen(!datePickerOpen); setTravelersPickerOpen(false); }}
              >
                <Clock className="w-5 h-5 text-slate-400 mr-3 group-hover:text-[#136b55] transition-colors" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Dates</p>
                  <p className="font-semibold text-slate-800 text-sm">{dates}</p>
                </div>
                {datePickerOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-40 w-64" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Select Date</p>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          const d = new Date(e.target.value);
                          const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                          setDates(formatted);
                          setDatePickerOpen(false);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#136b55]/20 focus:border-[#136b55]"
                    />
                  </div>
                )}
              </div>

              <div className="w-px bg-slate-100 hidden md:block my-2"></div>

              <div
                className="flex-1 flex items-center px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group relative"
                onClick={() => { setTravelersPickerOpen(!travelersPickerOpen); setDatePickerOpen(false); }}
              >
                <Users className="w-5 h-5 text-slate-400 mr-3 group-hover:text-[#136b55] transition-colors" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Travelers</p>
                  <p className="font-semibold text-slate-800 text-sm">{travelers} Guests</p>
                </div>
                {travelersPickerOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-40 w-48 text-slate-855" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Guests</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800">{travelers}</span>
                      <button
                        onClick={() => setTravelers(travelers + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (searchQuery) {
                    navigate(`/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`);
                  } else {
                    navigate('/states');
                  }
                }}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#136b55] transition-all duration-200 active:scale-95 shrink-0"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="text-on-surface-variant text-xs font-semibold">Trending:</span>
            {["Taj Mahal", "Amer Fort", "Varanasi Ghats", "Hampi"].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-sm transition-all duration-150 hover:scale-105"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRUST BAR ─────────────────────────── */}
      <section className="bg-surface-container-lowest border-b border-outline-variant/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
            {[["1500+", "Heritage Sites"], ["500+", "Cities Mapped"], ["42", "UNESCO Landmarks"], ["5", "Curated Trails"]].map(([num, label]) => (
              <div key={label} className="py-4 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                <p className="text-2xl sm:text-3xl font-black text-primary">{num}</p>
                <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CITIES ────────────────────────────── */}
      <section id="cities" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Heritage Hubs</span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1.5">Choose Your City</h2>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
              Every city has a different story. Pick yours and start exploring.
            </p>
          </div>
          <Link to="/cities" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all mt-3 md:mt-0">
            View all cities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {CITIES.map((city) => (
            <Link to="/cities" key={city.name} className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer block">
              <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />

              {/* Season badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg text-on-surface">
                  Best: {city.season}
                </span>
              </div>

              {/* City info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-black text-xl mb-2">{city.name}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {city.stats.map((s) => (
                    <div key={s.label} className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                      <p className="text-white font-bold text-xs">{s.value}</p>
                      <p className="text-slate-300 text-[9px] leading-tight mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/cities" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Start Exploring All Cities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── SECTION 4: HERITAGE TRAILS ───────────────────── */}
      <section id="trails" className="py-16 sm:py-24 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Curated Routes</span>
              <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1.5">Famous Heritage Circuits</h2>
              <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                Follow historic pathways etched by dynasties. Each circuit is a complete journey, not just a list.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CIRCUITS.map((c) => (
              <Link to="/trails" key={c.title} className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-tertiary text-on-tertiary font-bold text-[10px] px-2.5 py-1 rounded-lg">{c.days} Journey</span>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <h3 className="font-black text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">{c.route}</p>
                  <p className="text-on-surface-variant text-xs sm:text-sm mt-3 leading-relaxed flex-1">{c.desc}</p>

                  {/* Highlights */}
                  <div className="mt-4 space-y-1.5">
                    {c.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-outline-variant/30 pt-4 mt-5">
                    <span className="text-primary text-xs font-bold uppercase tracking-wider group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                      View Trail <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/trails" className="inline-flex items-center gap-2 border-2 border-on-surface hover:bg-on-surface hover:text-surface-container-lowest text-on-surface font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200">
              View All Heritage Trails <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CATEGORIES ────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Browse by Type</span>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1.5">What Are You Looking For?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link to="/categories" key={cat.name} className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-black text-base sm:text-lg">{cat.name}</p>
                <p className="text-on-surface-variant/80 text-xs mt-1">{cat.count}</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: AI PLANNER ────────────────────────── */}
      <section id="planner" className="py-16 sm:py-24 bg-surface-container border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">AI-Powered</span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1.5">Plan Your Journey in 30 Seconds</h2>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
              Tell us your destination, how long you're staying, and what you love. We'll build the day.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left: form */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-6 sm:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">AI Travel Guide</p>
                  <h3 className="text-on-surface font-black text-lg">Your preferences</h3>
                </div>
              </div>

              <div className="space-y-5">
                {/* City */}
                <div>
                  <label htmlFor="demo-home-planner-city" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Destination</label>
                  <select
                    id="demo-home-planner-city"
                    value={plannerCity}
                    onChange={(e) => { const c = e.target.value; setPlannerCity(c); setItinerary(FALLBACK_ITINERARIES[c]); }}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-['Inter'] cursor-pointer"
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
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Trip Duration</label>
                  <div className="grid grid-cols-5 gap-2">
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
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Travel Interests</label>
                  <div className="grid grid-cols-2 gap-2">
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
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-95 disabled:bg-outline-variant/50 text-on-primary font-bold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-95 cursor-pointer">
                  {plannerLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading itinerary...</>
                  ) : (
                    <><Compass className="w-4 h-4" /> Plan My Route</>
                  )}
                </button>
              </div>
            </div>

            {/* Right: itinerary with photos */}
            <div className="lg:col-span-8">
              {itinerary && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Your Itinerary</p>
                      <h3 className="text-on-surface font-black text-2xl mt-1">{itinerary.title}</h3>
                    </div>
                    <span className="self-start bg-primary text-on-primary text-xs font-black px-3.5 py-1.5 rounded-full">
                      {itinerary.duration}
                    </span>
                  </div>

                  {itinerary.days.map((dayData, di) => (
                    <div key={di} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-outline-variant flex items-center gap-3 bg-surface-container-low">
                        <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-black flex items-center justify-center">{dayData.day}</span>
                        <span className="text-on-surface font-bold text-sm">{dayData.theme}</span>
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
                                <p className="text-on-surface font-bold text-sm truncate">{act.place}</p>
                                <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded shrink-0">{act.time}</span>
                              </div>
                              <p className="text-on-surface-variant text-xs leading-relaxed">{act.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="text-center">
                    <button className="inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-on-primary font-bold px-7 py-3 rounded-full text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer">
                      Plan My Full Journey <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 7: WHY ZEQUE ─────────────────────────── */}
      <section className="py-16 sm:py-24 bg-surface-container-lowest border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Difference</span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-1.5">Why Travelers Choose ZeQue</h2>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Headout has tickets. TripAdvisor has reviews. Google has locations. We have all three — plus the context to make sense of it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {WHY_ZEQUE.map((w) => (
              <div key={w.title} className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-7 hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
                <div className="text-3xl mb-4">{w.icon}</div>
                <h3 className="font-black text-on-surface text-base mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="#" className="inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-on-primary font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Find Places Near Me <MapPin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
