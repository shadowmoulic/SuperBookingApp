import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Heart, SlidersHorizontal, ChevronRight, ChevronDown, CheckCircle, Zap, Compass, Check } from 'lucide-react';
import api from '../api/api';

const STATES_DATA = {
  karnataka: {
    name: 'Karnataka',
    tagline: 'Heritage & Discovery',
    description: 'Discover curated heritage sites, museums, forts, temples, and cultural experiences in the heart of South India.',
    attractionsCount: '120+',
    citiesCount: '15',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGMiZYYBKKncNnPXHKiGVIEYqAvLNnfFH8kCTUlVeiS_-DCZ-ME5caatacmFnLLgcT6Q4O7u95xXZZuoXkGrQkeGgx9SnC4ulWpAE2h40oZXCcQSmzAPXVUurjJQr2kfCM8-IAuLwj6lvmaqa1zv6bgRbhjFHsry9twwfjGyPlDsY7QJWJef-eq-lHy2qjW8I2YB2Q3ghNi9Gt4eH2lFd0TQBRrRd4fmByvrYv1SWAwtXzrLYem9cCslN87N5eC-A4H7Ne3fopjBhn',
    cities: [
      { name: 'Bengaluru', desc: 'The Garden City & Tech Hub', size: 'col-span-1 md:col-span-2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM0YhSFCqt7pHdlhWdWulztaoR4Bkj8_DAr26U-sjovfH6jPaoAR0uhWrwiBZJyh4b6hrx7-VsjyxnEDw7NdSqhoY5wT95TodIYHVsBw2iyNb92z3_nWfDMf70UPS2vlpHDjdhCucOWbYK84JelRaHHZp4JZhPdmK7SRuA-R-Ccqjp0YtGJ0BmIm8N189tl5X7mT3XkClFPITKq9VaWfPdTSur6n5fQ1qasPCbhEI7SkFVMQhF-lD14aQzD1dYYH1K5752xE-TgvVC', attractions: '42' },
      { name: 'Mysuru', desc: 'Cultural Capital', size: 'col-span-1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUWr1VixdRFBUoWNkt-9qlhO8zMrAu1DO_9OHRL0b3R6xKovPbm8GgJ4RXpl3VsI_xSyhn1Ru6aFUSrYeRslDk17X3PjNfodCuWPFkp0rji6xPjFhSlQwVNLi5zh__FhCD-GsqTRx0KjwrNZbrJuVLQLuwuxeDmC1hVr2fxUJb1u19_bR2w4z8oT-2ljMFGkYdNqxW0ez_3Zxc6_p3jBHI02YRpHNckoCFk9AXBkNVKawjAm8CZzezGFY_qwwnl-Vhc9I3xgq9WwNL', attractions: '28' },
      { name: 'Hampi', desc: 'Kingdom of Ruins', size: 'col-span-1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC57GMIIVp13zCN3MN_TpyPRl4URl18ZlPOQKHeX7G7E_h_R9VQWyDYdkK_XKjBi97Rin8WSJ8mPJiDmWtKKZQuGVWM7dXQnXfQeZJVJp3rKLPTJLoybu_oN6KsvNv4mTlv1OkxAw_JMv32dP2eoJdv3MAD71JWJUKKuTVp12MvpF8jUz6eNPyD1_LfqB6S1By5agPE0W7ZuzzJ1gWsQliA0v8tRbB55_v9dM1FW1JUtooaJswzXESX1AgAqD0RxrR8V0I8peIi4hD5', attractions: '35' },
      { name: 'Coorg', desc: 'Scotland of India', size: 'col-span-1 md:col-span-2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7R8NDTqXe-H1gA1BSOh6X_8ZjIO-xCjHApxE3fcDxTNbg6gfTUyc5fTjKgvuhnBWrl745JtVbsk-daLYJ8jqGoKJ6nM9rG9ePZAPB_u1AN5CFRD8EzGoZ4s0wle7bszBLgPru6tKEkaK9TVbO8Jp_wh_8AHcYCKjGNctQBX5cTf78Ul6efqEI9udVpBCihdF-E6FiD05dyn5LepCXHlhuB0NTkfMlHQMHhucktZHFJNmQHRk6Ayc3ZzqUm5Db54ETyvC-ketZ5LA', attractions: '20' }
    ],
    attractions: [
      { name: 'Mysore Palace', category: 'Palace', rating: '4.9', location: 'Mysuru', fee: '149', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TsRiEYfe4AfZi63dqe24OXRYM8SeSxix_MfcjbuqDMoVfvUxtonOB44VlQ7iBKn2s3Z2e5m0nUAlMtT71gFGd8gG3UziOmQbwUBYESEpSwyzIVPy63K8DjI01DLYfd7C2ArpgULNCaYpqZO4VwQYY7L4VxnPp-8WzG4vBVqU5RV3eam8bMg4GKB2KyHK1_-IBlSsYL6ju-O2nWsfKRQTYnD45mX0x9Uxb5q0rYLEJzbNuIZYqGBkGgi5muMJpGG1yS25N8V4Vrqc' },
      { name: 'Bangalore Palace', category: 'Heritage', rating: '4.7', location: 'Bengaluru', fee: '480', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHWmBORy2dYY-leHZ5wRjV0KTKUxUcsBuh2jJVYsjGttk17Uh1wh1mkZVVIKvjjPbRgowiq90syagQHbMkQsyXp_vm8GCY4vIX1D7-E3KxrO2YMj1hQhMPA4-ygvYXupco2loT0RBr4gsi8GOhs8JtwhxhKUU-M5ZPVxxQGaEMI2fL_8cKc8o_9Qo5IGJRSwB7xa8eQjwg0aArYaddjq-HirB39Yq9ECggnDr5_fJt4Zw8SVE7cpN2Mx1RwNTWc0tx5GgPsQrwOglU' },
      { name: 'Hampi Ruins', category: 'UNESCO Site', rating: '5.0', location: 'Hampi', fee: 'Free', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD_yWEo0uAogXptZwCRWs41VZn8XsuZyUXJREvRarHIpNOJYessYg2daFFXSny2Ty-y7bhG5_uIfoVdwvG8t49K5TJVsLo-FCDrzEx3nXdhKfjm2fOXYbL139O3WzpADqIFx_rDqnVX3a4sZf98JgxuyekPjrqeWkyqRWzrHVWJZJaDkC-uXDr85K-7ABOH4mB6tqQNtiAaSlJu5-EsSkg_6rwZ9Hmn2I77VnZNnAou9TWf_PFGrzLEL7qEdg8UAXyuT1MH5Hy7BDL' },
      { name: 'Abbey Falls', category: 'Nature', rating: '4.5', location: 'Coorg', fee: '15', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2sly3ZigfHmBgJl2obH2z-2YPgWTh_FF0xSAMuU1e_4xcxeEfyBLizpPRZcaXhUfOcpZ8YdexlKtgWBoBbcJ3qujpnksH_WvCy7W05YTw3qTRnDfWjgbAO9wVNRguLdml3lxQ0rNx_9FDp_-uiT7cIL0sMVck6x92P4OKVM6Hk4Kp1h0y1-CT9WWRqhKQrEvfmRPQxtZPtqY4SOldFQ2dD0PLcKkcPVbR2c7bM1RGSQMAHsNJD3AWTHRf_xo6Zx_G4h7R1Fv1OslD' }
    ]
  },
  rajasthan: {
    name: 'Rajasthan',
    tagline: 'Land of Kings',
    description: 'Explore grand palaces, formidable forts, vibrant deserts, and rich royal heritage in the princely state of Rajasthan.',
    attractionsCount: '142+',
    citiesCount: '12',
    img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
    cities: [
      { name: 'Jaipur', desc: 'The Pink City', size: 'col-span-1 md:col-span-2', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800', attractions: '34' },
      { name: 'Udaipur', desc: 'City of Lakes', size: 'col-span-1', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800', attractions: '18' },
      { name: 'Jodhpur', desc: 'The Blue City', size: 'col-span-1', img: 'https://images.unsplash.com/photo-1562158074-d021c172ee18?auto=format&fit=crop&q=80&w=800', attractions: '22' },
      { name: 'Jaisalmer', desc: 'The Golden City', size: 'col-span-1 md:col-span-2', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=800', attractions: '15' }
    ],
    attractions: [
      { name: 'Amer Fort', category: 'Fort', rating: '4.8', location: 'Jaipur', fee: '100', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=800' },
      { name: 'Hawa Mahal', category: 'Palace', rating: '4.6', location: 'Jaipur', fee: '50', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=800' },
      { name: 'City Palace', category: 'Palace', rating: '4.7', location: 'Udaipur', fee: '250', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  kerala: {
    name: 'Kerala',
    tagline: "God's Own Country",
    description: 'Immerse yourself in tranquil backwaters, mist-clad hills, lush spice plantations, and classical arts of Kerala.',
    attractionsCount: '89+',
    citiesCount: '10',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    cities: [
      { name: 'Kochi', desc: 'Queen of the Arabian Sea', size: 'col-span-1 md:col-span-2', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=800', attractions: '24' },
      { name: 'Munnar', desc: 'Hill Station & Tea Gardens', size: 'col-span-1', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800', attractions: '16' },
      { name: 'Alleppey', desc: 'Venice of the East', size: 'col-span-1', img: 'https://images.unsplash.com/photo-1593693411515-c202e974fe08?auto=format&fit=crop&q=80&w=800', attractions: '12' },
      { name: 'Wayanad', desc: 'Land of Paddy Fields', size: 'col-span-1 md:col-span-2', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800', attractions: '14' }
    ],
    attractions: [
      { name: 'Eravikulam National Park', category: 'Wildlife', rating: '4.6', location: 'Munnar', fee: '120', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800' },
      { name: 'Athirappilly Waterfalls', category: 'Nature', rating: '4.8', location: 'Thrissur', fee: '50', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800' }
    ]
  }
};

const NAV_STATES = [
  { id: 'all', name: 'All India', path: '/states' },
  { id: 'karnataka', name: 'Karnataka', path: '/karnataka' },
  { id: 'tamilnadu', name: 'Tamil Nadu', path: '/tamilnadu' },
  { id: 'kerala', name: 'Kerala', path: '/kerala' },
  { id: 'rajasthan', name: 'Rajasthan', path: '/rajasthan' },
  { id: 'goa', name: 'Goa', path: '/goa' },
  { id: 'maharashtra', name: 'Maharashtra', path: '/maharashtra' }
];

export default function StateDetails() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const normalizedStateId = locationName ? locationName.toLowerCase() : 'karnataka';
  
  const stateInfo = STATES_DATA[normalizedStateId] || STATES_DATA.karnataka;

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedRating, setSelectedRating] = useState('Rating');
  const [favorites, setFavorites] = useState({});
  const [dbExperiences, setDbExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch experiences from DB in parallel if they match the locations of this state (e.g. Hampi, Jaipur, etc.)
  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const citiesList = stateInfo.cities.map(c => c.name);
        const fetchPromises = citiesList.map(city => 
          api.get(`/api/experiences/?location=${city}`).catch(err => {
            console.error(`Error fetching experiences for ${city}:`, err);
            return { data: [] }; // Fallback for failed requests to avoid failing all
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
  }, [normalizedStateId, stateInfo]);

  // Combine DB experiences with mock experiences to show a complete, robust list
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

    const uniqueMocks = stateInfo.attractions.filter(mock => 
      !dbFormatted.some(db => db.name.toLowerCase() === mock.name.toLowerCase())
    );

    return [...dbFormatted, ...uniqueMocks];
  }, [dbExperiences, stateInfo]);

  // Apply filters
  const filteredAttractions = useMemo(() => {
    return allExperiences.filter(item => {
      if (activeCategory !== 'All') {
        const itemCatLower = item.category.toLowerCase();
        const activeCatLower = activeCategory.toLowerCase();
        if (activeCatLower === 'museums' && itemCatLower === 'museum') return true;
        if (activeCatLower === 'forts' && itemCatLower === 'fort') return true;
        if (activeCatLower === 'palaces' && itemCatLower === 'palace') return true;
        if (activeCatLower === 'temples' && itemCatLower === 'religious site') return true;
        if (itemCatLower !== activeCatLower) {
          return false;
        }
      }
      if (selectedCity !== 'All Cities') {
        if (item.location.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }
      if (selectedRating !== 'Rating') {
        const ratingNum = parseFloat(item.rating);
        if (selectedRating === '4.5+' && ratingNum < 4.5) return false;
        if (selectedRating === '4.0+' && ratingNum < 4.0) return false;
      }
      return true;
    });
  }, [allExperiences, activeCategory, selectedCity, selectedRating]);

  const toggleFavorite = (name) => {
    setFavorites(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#fcf8f9] text-[#1b1b1c] font-['Sora'] antialiased pb-24 md:pb-0">
      
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative bg-[#F7F9F9] pt-28 pb-24 overflow-hidden border-b border-[#E8ECEB]">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-1.5 text-[#3e4945] text-xs font-semibold mb-8">
            <Link to="/" className="hover:text-[#006955] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/states" className="hover:text-[#006955] transition-colors">India</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#006955] font-bold">{stateInfo.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1b1b1c] mb-6 tracking-tight">
                Explore {stateInfo.name}
              </h1>
              <p className="text-lg sm:text-xl text-[#3e4945] mb-10 max-w-xl leading-relaxed">
                {stateInfo.description}
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#006955]">{stateInfo.attractionsCount}</span>
                  <span className="text-xs text-[#3e4945] uppercase tracking-wider font-bold">Attractions</span>
                </div>
                <div className="h-12 w-px bg-[#bdc9c3]"></div>
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#006955]">{stateInfo.citiesCount}</span>
                  <span className="text-xs text-[#3e4945] uppercase tracking-wider font-bold">Cities</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-[400px] rounded-[32px] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              <img 
                alt={stateInfo.name} 
                className="w-full h-full object-cover" 
                src={stateInfo.img}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fcf8f9] to-transparent"></div>
      </section>

      {/* Mobile Header / TopAppBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 py-3 bg-[#fcf8f9]/85 backdrop-blur-md border-b border-[#E8ECEB] md:hidden">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006955] text-2xl">menu</span>
          <span className="text-lg font-bold text-[#006955]">ZeQue</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#006955] text-2xl">search</span>
        </div>
      </header>

      {/* Mobile Hero Section */}
      <section className="px-4 py-4 md:hidden">
        <nav className="flex items-center gap-1 text-[#3e4945] text-[11px] font-semibold mb-3">
          <span>Home</span>
          <ChevronRight className="w-3 h-3 text-[#3e4945]" />
          <span>India</span>
          <ChevronRight className="w-3 h-3 text-[#3e4945]" />
          <span>States</span>
          <ChevronRight className="w-3 h-3 text-[#3e4945]" />
          <span className="text-[#006955] font-bold">{stateInfo.name}</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-[#1b1b1c] mb-1.5">Explore {stateInfo.name}</h1>
        <p className="text-sm text-[#3e4945] mb-4 leading-relaxed">{stateInfo.description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-[#006955] font-bold text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{stateInfo.attractionsCount} Attractions</span>
          </div>
          <div className="flex items-center gap-1 text-[#006955] font-bold text-xs">
            <span className="material-symbols-outlined text-sm leading-none">apartment</span>
            <span>{stateInfo.citiesCount} Cities</span>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap gap-1.5">
          {stateInfo.cities.map(c => (
            <span key={c.name} className="px-3 py-1 bg-[#006955]/10 text-[#006955] rounded-full text-xs font-semibold">
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* State Navigation Pill Bar */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-4 md:-mt-8 relative z-20">
        <div className="bg-white p-3 md:p-4 rounded-3xl md:rounded-[24px] shadow-sm flex items-center gap-2.5 overflow-x-auto no-scrollbar border border-[#E8ECEB]">
          {NAV_STATES.map((state) => {
            const isActive = normalizedStateId === state.id || (state.id === 'all' && locationName === undefined);
            return (
              <button
                key={state.id}
                onClick={() => navigate(state.path)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#006955] text-white shadow-sm font-bold scale-[1.02]' 
                    : 'bg-white border border-[#bdc9c3] text-[#3e4945] hover:border-[#006955] hover:text-[#006955]'
                }`}
              >
                {state.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Bar (Sticky) */}
      <section className="sticky top-[48px] md:top-20 z-40 bg-[#fcf8f9]/90 backdrop-blur-md border-b border-[#E8ECEB] py-3 mt-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 w-full lg:w-auto">
            {['All', 'Museums', 'Heritage', 'Forts', 'Palaces', 'Temples', 'Nature'].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full md:rounded-xl text-xs font-semibold transition-colors border cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#006955]/10 border-[#006955] text-[#006955]' 
                      : 'bg-[#f0edee] border-transparent text-[#3e4945] hover:bg-[#e5e2e3]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          
          <div className="hidden md:flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none bg-[#f0edee] border border-[#bdc9c3] rounded-xl pl-4 pr-10 py-1.5 text-xs font-semibold text-[#1b1b1c] outline-none cursor-pointer focus:ring-2 focus:ring-[#006955]/20 focus:border-[#006955]"
              >
                <option value="All Cities">All Cities</option>
                {stateInfo.cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#3e4945]" />
            </div>

            <div className="relative">
              <select 
                value={selectedRating} 
                onChange={(e) => setSelectedRating(e.target.value)}
                className="appearance-none bg-[#f0edee] border border-[#bdc9c3] rounded-xl pl-4 pr-10 py-1.5 text-xs font-semibold text-[#1b1b1c] outline-none cursor-pointer focus:ring-2 focus:ring-[#006955]/20 focus:border-[#006955]"
              >
                <option value="Rating">Rating</option>
                <option value="4.5+">4.5+</option>
                <option value="4.0+">4.0+</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#3e4945]" />
            </div>

            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f0edee] border border-[#bdc9c3] rounded-xl text-xs font-semibold hover:bg-[#e5e2e3] transition-colors cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Attraction Grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h2 className="hidden md:block text-2xl font-bold text-[#1b1b1c] mb-8">Recommended Attractions</h2>
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-16 bg-[#F7F9F9] rounded-2xl border border-dashed border-[#bdc9c3]">
            <Compass className="w-12 h-12 text-[#bdc9c3] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1b1b1c]">No attractions found</h3>
            <p className="text-[#3e4945] text-sm">Try resetting filters to explore other heritage sites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredAttractions.map((item, index) => {
              const isFav = !!favorites[item.name];
              const cardContent = (
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
                      <p className="text-xs font-bold text-[#006955]">{item.fee.startsWith('₹') ? item.fee : item.fee}</p>
                    </div>
                  </div>
                </div>
              );

              return item.isDb ? (
                <Link key={item.id} to={`/experience/${item.id}`}>{cardContent}</Link>
              ) : (
                <div key={index} onClick={() => alert(`${item.name} booking detail page is coming soon!`)}>{cardContent}</div>
              );
            })}
          </div>
        )}
      </section>

      {/* Explore Cities */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#1b1b1c] mb-6 md:mb-8">Explore Cities</h2>
        
        {/* Mobile vertical listing */}
        <div className="flex flex-col gap-4 md:hidden">
          {stateInfo.cities.map((city, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/${city.name.toLowerCase()}`)}
              className="relative h-24 rounded-2xl overflow-hidden group active:opacity-90 transition-opacity cursor-pointer"
            >
              <img 
                alt={city.name} 
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500" 
                src={city.img} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-between px-6 text-white z-10">
                <div>
                  <h4 className="text-lg font-bold">{city.name}</h4>
                  <p className="text-xs opacity-90">{city.attractions} Attractions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
          {stateInfo.cities.map((city, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/${city.name.toLowerCase()}`)}
              className="relative group rounded-[24px] overflow-hidden cursor-pointer shadow-sm min-h-[250px] flex items-end p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
            >
              <img 
                alt={city.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src={city.img} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-white mb-1">{city.name}</h3>
                <p className="text-white/80 text-xs font-semibold">{city.desc}</p>
              </div>
            </div>
          ))}
        </div>
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
              Subscribe to get the latest heritage stories, travel guides, and exclusive offers for {stateInfo.name}'s best destinations.
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
