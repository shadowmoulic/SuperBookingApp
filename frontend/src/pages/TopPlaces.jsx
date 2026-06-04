import React from 'react';
import { Trophy, TrendingUp, Star } from 'lucide-react';

const TopPlaces = () => {
  const categories = [
    { title: "Top 100 Attractions In India", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-100" },
    { title: "Best Places To Visit In India", icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Most Visited Monuments", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Top Places & Rankings</h1>
        <p className="text-gray-600 mb-16 max-w-2xl text-lg text-center mx-auto">Discover the absolute best of India. These curated lists feature the highest-rated, most popular, and universally loved destinations.</p>
        
        <div className="space-y-16">
          {categories.map((category, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className={`w-14 h-14 ${category.bg} rounded-2xl flex items-center justify-center`}>
                  <category.icon className={`w-7 h-7 ${category.color}`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(rank => (
                  <div key={rank} className="relative group cursor-pointer">
                    <div className="absolute -left-4 -top-4 w-10 h-10 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center shadow-lg z-20 transform -rotate-6 group-hover:rotate-0 transition-transform">
                      #{rank}
                    </div>
                    <div className="bg-gray-100 h-48 rounded-2xl mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">Amazing Destination {rank}</h3>
                    <p className="text-gray-500 text-sm">Region, State</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button className="text-indigo-600 font-bold hover:bg-indigo-50 px-6 py-3 rounded-xl transition-colors">View Full List →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPlaces;
