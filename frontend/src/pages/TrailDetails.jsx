import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Compass, Clock, CheckCircle, Zap, Heart, Star, MapPin, ChevronRight, ChevronDown, Check } from 'lucide-react';
import api from '../api/api';

const TRAILS_DATA = {
  'golden-triangle': {
    name: 'Golden Triangle Trail',
    tagline: 'Delhi • Agra • Jaipur',
    days: '5 Days',
    desc: "India's definitive introduction — Mughal grandeur, royal forts, and marble mausoleums.",
    img: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80',
    stops: ['Delhi', 'Agra', 'Jaipur'],
    itinerary: [
      { day: 1, title: 'Old Delhi Mughal Splendor', desc: 'Explore the historic Red Fort and climb minarets of Jama Masjid.' },
      { day: 2, title: 'New Delhi Landmarks', desc: 'Visit Qutub Minar, Humayun\'s Tomb, and the grand India Gate.' },
      { day: 3, title: 'The Taj Mahal & Agra Fort', desc: 'Sunrise Taj Mahal entry followed by Agra Fort exploration.' },
      { day: 4, title: 'Pink City Royal Forts', desc: 'Explore Amer Fort, Hawa Mahal, and local bazaars in Jaipur.' },
      { day: 5, title: 'Palaces & departure', desc: 'Visit City Palace and Jantar Mantar observatory before wrapping up.' }
    ]
  },
  'rajasthan-royal-trail': {
    name: 'Rajasthan Royal Trail',
    tagline: 'Jaipur • Jodhpur • Udaipur',
    days: '7 Days',
    desc: 'Hilltop forts, shimmering palace lakes, and the living royalty of the desert state.',
    img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    stops: ['Jaipur', 'Jodhpur', 'Udaipur'],
    itinerary: [
      { day: 1, title: 'Pink City Arrival', desc: 'Visit Hawa Mahal and Jantar Mantar in Jaipur.' },
      { day: 2, title: 'Fortresses of Jaipur', desc: 'Climb Amer Fort and watch sunset at Nahargarh Fort.' },
      { day: 3, title: 'Blue City Jodhpur', desc: 'Drive to Jodhpur, explore Mehrangarh Fort towering above.' },
      { day: 4, title: 'Jodhpur Heritage Walk', desc: 'Explore local spices markets and blue alleys.' },
      { day: 5, title: 'City of Lakes Udaipur', desc: 'Drive to Udaipur, boat ride on Lake Pichola.' },
      { day: 6, title: 'Udaipur City Palace', desc: 'Tour the grand Lakeside City Palace complex.' },
      { day: 7, title: 'Departure from Udaipur', desc: 'Wrap up with souvenirs and local handicrafts.' }
    ]
  },
  'buddhist-circuit': {
    name: 'Buddhist Circuit Trail',
    tagline: 'Bodh Gaya • Sarnath • Kushinagar',
    days: '6 Days',
    desc: 'Follow the footsteps of Buddha through ancient spiritual monasteries and stupas.',
    img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    stops: ['Bodh Gaya', 'Sarnath', 'Kushinagar'],
    itinerary: [
      { day: 1, title: 'Bodh Gaya Monasteries', desc: 'Visit Mahabodhi temple where Buddha achieved enlightenment.' },
      { day: 2, title: 'Sarnath Excursion', desc: 'See Dhamek Stupa and Deer Park.' },
      { day: 3, title: 'Kushinagar Monasteries', desc: 'Explore the Parinirvana Stupa and local relics.' }
    ]
  },
  'temple-trail': {
    name: 'Temple Trail',
    tagline: 'Madurai • Thanjavur • Mahabalipuram',
    days: '8 Days',
    desc: 'A journey through the architectural Dravidian marvels of southern India.',
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    stops: ['Madurai', 'Thanjavur', 'Mahabalipuram'],
    itinerary: [
      { day: 1, title: 'Madurai Meenakshi Temple', desc: 'Witness the towering gopurams and evening temple rituals.' },
      { day: 2, title: 'Thanjavur Great Living Chola Temples', desc: 'Visit Brihadisvara Temple, architectural marvel of the Cholas.' },
      { day: 3, title: 'Shore Temples Mahabalipuram', desc: 'Explore UNESCO rock carvings and Shore Temples by the sea.' }
    ]
  }
};

const NAV_TRAILS = [
  { id: 'golden-triangle', name: 'Golden Triangle', path: '/trails/golden-triangle' },
  { id: 'rajasthan-royal-trail', name: 'Rajasthan Royal', path: '/trails/rajasthan-royal-trail' },
  { id: 'buddhist-circuit', name: 'Buddhist Circuit', path: '/trails/buddhist-circuit' },
  { id: 'temple-trail', name: 'Temple Trail', path: '/trails/temple-trail' }
];

export default function TrailDetails() {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const normalizedTrailId = trailId ? trailId.toLowerCase() : 'golden-triangle';
  const trailInfo = TRAILS_DATA[normalizedTrailId] || TRAILS_DATA['golden-triangle'];

  const [dbExperiences, setDbExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch experiences matching cities in this trail concurrently
  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const fetchPromises = trailInfo.stops.map(city => 
          api.get(`/api/experiences/?location=${city}`).catch(err => {
            console.error(`Error fetching experiences for ${city}:`, err);
            return { data: [] }; // Fallback to avoid failing the whole Promise.all
          })
        );
        const responses = await Promise.all(fetchPromises);
        const allFetched = [];
        responses.forEach(res => {
          const data = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.results)
              ? res.data.results
              : [];
          allFetched.push(...data);
        });
        setDbExperiences(allFetched);
      } catch (err) {
        console.error("Error loading experiences:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, [normalizedTrailId, trailInfo]);

  const toggleFavorite = (name) => {
    setFavorites(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  const allExperiences = useMemo(() => {
    const dbFormatted = dbExperiences.map(exp => ({
      name: exp.name,
      category: exp.category,
      rating: exp.average_rating ? Number(exp.average_rating).toFixed(1) : '4.5',
      location: exp.location,
      fee: exp.entry_fee_base ? `₹${Number(exp.entry_fee_base).toFixed(0)}` : 'Free',
      img: String(exp.image_url || '').split(',')[0] || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
      id: exp.public_id || exp.id,
      isDb: true
    }));

    return dbFormatted;
  }, [dbExperiences]);

  return (
    <div className="min-h-screen bg-[#fcf8f9] text-[#1b1b1c] font-['Sora'] antialiased pb-24 md:pb-0">
      
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative bg-[#F7F9F9] pt-28 pb-24 overflow-hidden border-b border-[#E8ECEB]">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-1.5 text-[#3e4945] text-xs font-semibold mb-8">
            <Link to="/" className="hover:text-[#006955] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/trails" className="hover:text-[#006955] transition-colors">Trails</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#006955] font-bold">{trailInfo.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-[#006955]/10 text-[#006955] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">
                {trailInfo.days} Journey
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1b1b1c] mb-6 tracking-tight">
                {trailInfo.name}
              </h1>
              <p className="text-lg text-[#006955] font-bold mb-6">
                Stops: {trailInfo.stops.join(' ➔ ')}
              </p>
              <p className="text-base text-[#3e4945] leading-relaxed max-w-xl">
                {trailInfo.desc}
              </p>
            </div>
            <div className="hidden lg:block relative h-[400px] rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                alt={trailInfo.name} 
                className="w-full h-full object-cover" 
                src={trailInfo.img}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fcf8f9] to-transparent"></div>
      </section>

      {/* Mobile TopAppBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 py-3 bg-[#fcf8f9]/85 backdrop-blur-md border-b border-[#E8ECEB] md:hidden">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006955] text-2xl">menu</span>
          <span className="text-lg font-bold text-[#006955]">ZeQue</span>
        </div>
        <span className="material-symbols-outlined text-[#006955] text-2xl">search</span>
      </header>

      {/* Mobile Hero Section */}
      <section className="px-4 py-4 md:hidden">
        <nav className="flex items-center gap-1 text-[#3e4945] text-[11px] font-semibold mb-3">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span>Trails</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#006955] font-bold">{trailInfo.name}</span>
        </nav>
        <span className="bg-[#006955]/10 text-[#006955] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5 inline-block">
          {trailInfo.days} Journey
        </span>
        <h1 className="text-3xl font-extrabold text-[#1b1b1c] mb-1.5">{trailInfo.name}</h1>
        <p className="text-sm font-semibold text-[#006955] mb-2">Stops: {trailInfo.stops.join(' ➔ ')}</p>
        <p className="text-sm text-[#3e4945] leading-relaxed">{trailInfo.desc}</p>
      </section>

      {/* Trail Navigation Pill Bar */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-4 md:-mt-8 relative z-20">
        <div className="bg-white p-3 md:p-4 rounded-3xl md:rounded-[24px] shadow-sm flex items-center gap-2.5 overflow-x-auto no-scrollbar border border-[#E8ECEB]">
          {NAV_TRAILS.map((t) => {
            const isActive = normalizedTrailId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.path)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#006955] text-white shadow-sm font-bold scale-[1.02]' 
                    : 'bg-white border border-[#bdc9c3] text-[#3e4945] hover:border-[#006955] hover:text-[#006955]'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Day-by-Day Itinerary Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        <h2 className="text-2xl font-bold text-[#1b1b1c] mb-8">Day-by-Day Route Itinerary</h2>
        <div className="space-y-6 max-w-3xl">
          {trailInfo.itinerary.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E8ECEB] rounded-[24px] p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-8 h-8 rounded-full bg-[#006955] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {item.day}
              </span>
              <div>
                <h3 className="font-bold text-base text-[#1b1b1c] mb-1">Day {item.day}: {item.title}</h3>
                <p className="text-[#3e4945] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monuments list along this trail */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 border-t border-[#E8ECEB] mt-8">
        <h2 className="text-2xl font-bold text-[#1b1b1c] mb-8">Monuments & Attractions on this Route</h2>
        {loading ? (
          <div className="text-center py-10">Loading Route Attractions...</div>
        ) : allExperiences.length === 0 ? (
          <div className="text-center py-16 bg-[#F7F9F9] rounded-2xl border border-dashed border-[#bdc9c3]">
            <Compass className="w-12 h-12 text-[#bdc9c3] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1b1b1c]">Cataloging monuments</h3>
            <p className="text-[#3e4945] text-sm">We are currently linking more attractions to this circuit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {allExperiences.map((item) => {
              const isFav = !!favorites[item.name];
              return (
                <Link key={item.id} to={`/attraction/${item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : item.id}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-[0px_12px_24px_rgba(0,0,0,0.04)] border border-[#E8ECEB] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full cursor-pointer active:scale-95">
                    <div className="relative h-32 sm:h-48 md:h-64 overflow-hidden">
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={item.img} 
                      />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item.name);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-white'}`} />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-[#006955]/90 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3 flex-grow flex flex-col justify-between gap-1">
                      <div>
                        <h3 className="font-bold text-sm text-[#1b1b1c] truncate group-hover:text-[#006955] transition-colors">{item.name}</h3>
                        <div className="flex items-center gap-0.5 text-[#3e4945] text-[11px]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#E8ECEB]/50">
                        <div className="flex items-center gap-0.5 text-[#FEBB02]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-[#1b1b1c]">{item.rating}</span>
                        </div>
                        <p className="text-xs font-bold text-[#006955]">{item.fee}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="bg-[#F7F9F9] py-16 md:py-20 border-y border-[#E8ECEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1b1c] mb-12">Why Explore with ZeQue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Verified Attractions</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Hand-picked and personally vetted experiences for maximum quality and safety.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Booking</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Seamless digital tickets and reservations delivered instantly to your account.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Local Experiences</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Gain access to off-beat trails and authentic local cultural narratives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="bg-[#00846c] rounded-[32px] p-8 sm:p-20 relative overflow-hidden flex flex-col items-center text-center text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Stay Updated</h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 leading-relaxed">
              Subscribe to get the latest heritage stories, travel guides, and exclusive offers for this trail's destinations.
            </p>
            {subscribed ? (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mx-auto max-w-md">
                <Check className="w-5 h-5 text-white" />
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm"
                  required
                />
                <button 
                  type="submit"
                  className="bg-white text-[#00846c] px-6 py-3 rounded-xl font-bold hover:bg-[#F7F9F9] transition-all cursor-pointer text-sm whitespace-nowrap active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white shadow-lg rounded-t-xl border-t border-[#E8ECEB] md:hidden">
        <a className="flex flex-col items-center justify-center bg-[#006955]/10 text-[#006955] rounded-xl px-3 py-1 scale-95 transition-all cursor-pointer">
          <Compass className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">Discover</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Wishlist</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg leading-none">confirmation_number</span>
          <span className="text-[10px] font-bold">Bookings</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg leading-none">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </a>
      </nav>
    </div>
  );
}
