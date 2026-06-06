import React from 'react';
import { Castle, Landmark, Crown, Building2, Globe } from 'lucide-react';

const CategoryIndex = () => {
  const categories = [
    { name: 'Forts', icon: Castle },
    { name: 'Museums', icon: Landmark },
    { name: 'Palaces', icon: Crown },
    { name: 'Temples', icon: Building2 },
    { name: 'UNESCO Sites', icon: Globe, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Browse Categories</h1>
        <p className="text-gray-600 mb-12 max-w-2xl text-lg">Browse attractions by category. Whether you are interested in forts, museums, or majestic palaces, we have comprehensive guides available.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className={`bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer text-center group border ${category.highlight ? 'border-amber-400 bg-amber-50/30' : 'border-gray-100'}`}>
                <div className={`w-16 h-16 ${category.highlight ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-[#136b55]'} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className={`font-bold ${category.highlight ? 'text-amber-800' : 'text-gray-900'}`}>{category.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryIndex;
