import React from 'react';
import { Map, Clock, IndianRupee } from 'lucide-react';

const TrailIndex = () => {
  const trails = [
    { name: "Golden Triangle", desc: "Delhi, Agra, and Jaipur in one incredible journey.", days: 5 },
    { name: "Rajasthan Royal Trail", desc: "Experience the majestic forts and palaces of the Rajputana.", days: 7 },
    { name: "Buddhist Circuit", desc: "Follow the footsteps of Buddha through ancient spiritual sites.", days: 6 },
    { name: "Temple Trail", desc: "A journey through the architectural marvels of southern India.", days: 8 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Curated Trails</h1>
        <p className="text-gray-600 mb-12 max-w-2xl text-lg">Embark on our signature trails. These iconic routes are designed to give you the ultimate cultural experience.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trails.map((trail, index) => (
            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col sm:flex-row border border-gray-100 h-full">
              <div className="w-full sm:w-1/3 bg-gray-200 relative overflow-hidden min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
                  {trail.days} Days
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{trail.name}</h3>
                <p className="text-gray-500 mb-6">{trail.desc}</p>
                <div className="flex items-center gap-6 text-sm font-semibold text-gray-400 mt-auto">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg"><Map className="w-4 h-4 text-indigo-500" /> Route Map</span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg"><IndianRupee className="w-4 h-4 text-emerald-500" /> Est. Budget</span>
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
