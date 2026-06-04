import React from 'react';

const StateIndex = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">States of India</h1>
        <p className="text-gray-600 mb-12 max-w-2xl text-lg">Explore the diverse and culturally rich states of India. Choose a state to discover its cities, attractions, and trails.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for states */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-white text-xl font-bold">State {item}</h3>
                  <p className="text-gray-200 text-sm">Explore Region</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateIndex;
