import React from 'react';
import { Landmark, MapPin } from 'lucide-react';

const UnescoSites = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Landmark className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 font-serif">UNESCO World Heritage Sites</h1>
          <p className="text-xl text-gray-600 max-w-2xl">India is home to 42 World Heritage Sites. Explore these monuments of outstanding universal value, preserved for humanity.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-t-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border border-gray-100 group">
              <div className="h-64 bg-gray-200 relative overflow-hidden rounded-t-full m-2">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
              </div>
              <div className="p-8 text-center">
                <p className="text-amber-700 font-bold tracking-widest text-xs uppercase mb-3">Cultural Heritage</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Heritage Site {item}</h3>
                <p className="text-gray-500 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" /> State Name, India
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnescoSites;
