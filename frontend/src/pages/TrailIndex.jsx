import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, ArrowRight } from 'lucide-react';

const TrailIndex = () => {
  const navigate = useNavigate();

  const trails = [
    { 
      id: "golden-triangle", 
      name: "Golden Triangle", 
      desc: "Delhi, Agra, and Jaipur in one incredible journey showcasing Mughal grandeur and Rajput royal heritage.", 
      days: 5,
      img: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=600&q=80"
    },
    { 
      id: "rajasthan-royal-trail", 
      name: "Rajasthan Royal Trail", 
      desc: "Experience the majestic hilltop forts, shimmering lakes, and deserts of Jaipur, Jodhpur, and Udaipur.", 
      days: 7,
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
    },
    { 
      id: "buddhist-circuit", 
      name: "Buddhist Circuit", 
      desc: "Follow the footsteps of Buddha through ancient spiritual shrines, stupas, and peaceful monasteries.", 
      days: 6,
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    },
    { 
      id: "temple-trail", 
      name: "Temple Trail", 
      desc: "A journey through the architectural Dravidian marvels of Madurai, Thanjavur, and Mahabalipuram.", 
      days: 8,
      img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-['Sora']">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Curated Heritage Trails</h1>
        <p className="text-slate-600 mb-12 max-w-2xl text-base leading-relaxed">
          Embark on our signature circuits designed to give you the ultimate cultural experience with optimized routes and verified stopovers.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trails.map((trail) => (
            <div 
              key={trail.id} 
              onClick={() => navigate(`/trails/${trail.id}`)}
              className="bg-white rounded-[24px] overflow-hidden shadow-[0px_8px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer group flex flex-col sm:flex-row h-full"
            >
              <div className="w-full sm:w-2/5 relative overflow-hidden min-h-[200px]">
                <img 
                  src={trail.img} 
                  alt={trail.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-[#006955] shadow-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {trail.days} Days
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-[#006955] transition-colors">{trail.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{trail.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="flex items-center gap-1.5 bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    <Map className="w-3.5 h-3.5 text-[#006955]" />
                    Interactive Route Map
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#006955] transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-all" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrailIndex;
