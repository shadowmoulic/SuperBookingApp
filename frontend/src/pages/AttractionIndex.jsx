import React from 'react';
import { Star, MapPin, Clock, Search, Filter } from 'lucide-react';

const AttractionIndex = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Attractions</h1>
            <p className="text-gray-600 text-lg">Browse our massive directory of monuments and wonders.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <input type="text" placeholder="Search attractions..." className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#136b55] w-full md:w-64" />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             </div>
             <button className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 text-gray-600">
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* We show many items to simulate a massive directory */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full border border-gray-100">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 z-20 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> 4.8
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#136b55] transition-colors">Monument {i + 1}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" /> Jaipur, Rajasthan
                </p>
                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-50">
                  <span className="text-[#136b55] font-bold bg-emerald-50 px-2 py-1 rounded-md">₹50</span>
                  <span className="text-gray-500 flex items-center gap-1 font-medium"><Clock className="w-4 h-4" /> 2h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
           <button className="bg-[#136b55] hover:bg-[#0c4c3b] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-emerald-200">
             Load More Attractions
           </button>
        </div>
      </div>
    </div>
  );
};

export default AttractionIndex;
