import React, { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRight, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INDIAN_STATES = [
  {
    id: 'karnataka',
    name: 'Karnataka',
    tagline: 'Heritage & Discovery',
    bestMonth: 'Oct - Mar',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGMiZYYBKKncNnPXHKiGVIEYqAvLNnfFH8kCTUlVeiS_-DCZ-ME5caatacmFnLLgcT6Q4O7u95xXZZuoXkGrQkeGgx9SnC4ulWpAE2h40oZXCcQSmzAPXVUurjJQr2kfCM8-IAuLwj6lvmaqa1zv6bgRbhjFHsry9twwfjGyPlDsY7QJWJef-eq-lHy2qjW8I2YB2Q3ghNi9Gt4eH2lFd0TQBRrRd4fmByvrYv1SWAwtXzrLYem9cCslN87N5eC-A4H7Ne3fopjBhn',
    attractionsCount: 120
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    tagline: 'Land of Kings',
    bestMonth: 'Oct - Mar',
    img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 142
  },
  {
    id: 'kerala',
    name: 'Kerala',
    tagline: 'God\'s Own Country',
    bestMonth: 'Sep - Mar',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 89
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    tagline: 'Gateway to the Heart of India',
    bestMonth: 'Oct - Mar',
    img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 215
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    tagline: 'Abode of Snow',
    bestMonth: 'Mar - Jun',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 112
  },
  {
    id: 'goa',
    name: 'Goa',
    tagline: 'Pearl of the Orient',
    bestMonth: 'Nov - Feb',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 45
  },
  {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    tagline: 'Where Stories Never End',
    bestMonth: 'Nov - Feb',
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
    attractionsCount: 178
  }
];

const FAQS = [
  {
    question: "When is the best time to visit India?",
    answer: "The best time to visit most of India is during the winter months (October to March) when the weather is cool and dry. However, the Himalayas are best visited during summer (April to June), and the monsoon season (July to September) offers lush green landscapes in regions like Kerala and Goa."
  },
  {
    question: "Do I need to book heritage monuments in advance?",
    answer: "While many monuments offer on-the-spot tickets, we highly recommend booking in advance through ZeQue. This allows you to skip the long queues, especially at UNESCO World Heritage sites like the Taj Mahal, Amer Fort, and Qutub Minar during peak tourist season."
  },
  {
    question: "Which states have the most UNESCO World Heritage Sites?",
    answer: "Maharashtra leads with the highest number of UNESCO World Heritage Sites, including the Ajanta and Ellora Caves. It is closely followed by Rajasthan (Hill Forts), Delhi, and Uttar Pradesh (Taj Mahal, Agra Fort, Fatehpur Sikri)."
  }
];

const StateIndex = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredStates = INDIAN_STATES.filter(state => 
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#136b55] overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor"></circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)"></rect>
          </svg>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Discover the Incredible States of India
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto font-medium">
            From the majestic forts of Rajasthan to the serene backwaters of Kerala, explore the cultural diversity, rich heritage, and historic monuments of every Indian state.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-600/50 group-focus-within:text-[#136b55] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 bg-white shadow-xl shadow-emerald-900/20 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 sm:text-base font-semibold text-slate-900 transition-all"
              placeholder="Search by state name (e.g., Rajasthan, Kerala)..."
            />
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStates.map((state) => (
            <div 
              key={state.id} 
              onClick={() => navigate(`/${state.id}`)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={state.img} 
                  alt={state.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                
                {/* Top badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#136b55]" />
                    {state.attractionsCount} Sites
                  </span>
                </div>

                {/* Bottom text over image */}
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="text-3xl font-black text-white tracking-tight mb-1">{state.name}</h3>
                  <p className="text-emerald-300 text-sm font-semibold">{state.tagline}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Best Time to Visit</span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {state.bestMonth}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#136b55] transition-colors">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredStates.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No states found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </section>

      {/* SEO Content Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-a:text-[#136b55] hover:prose-a:text-emerald-700">
          <h2>Why Explore the States of India?</h2>
          <p>
            India is not just a country; it's a continent disguised as a nation. Each state operates almost like a distinct country, boasting its own language, cuisine, architecture, and historical lineage. From the snow-capped peaks of Himachal Pradesh in the north to the ancient Dravidian temples of Tamil Nadu in the south, the diversity is unparalleled.
          </p>
          <h3>Uncover Centuries of Heritage</h3>
          <p>
            Whether you're exploring the Rajputana grandeur of the forts in Rajasthan, tracing the roots of the Maratha empire in Maharashtra, or wandering through the Portuguese-influenced streets of Goa, every state tells a different story. ZeQue makes it effortless to book tickets to India's most iconic monuments, ensuring you spend your time experiencing history rather than waiting in lines.
          </p>
          <h3>Planning Your Indian Adventure</h3>
          <p>
            The climate in India varies drastically. While the coastal states are tropical and warm year-round, the northern regions experience distinct summers and winters. We've compiled the <strong>best time to visit</strong> for every state to help you plan the perfect itinerary. Dive into a state to explore curated heritage trails, uncover hidden gems, and seamlessly book your entry tickets.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60 mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
              >
                <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-[#136b55] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default StateIndex;
