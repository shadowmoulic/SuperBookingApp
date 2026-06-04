import React, { useState } from 'react';
import { BookMarked, MapPin, Calendar, Settings, Compass, ChevronRight } from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const savedAttractions = [
    { id: 1, name: 'Amer Fort', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Taj Mahal', city: 'Agra', img: 'https://images.unsplash.com/photo-1564507592208-028fdb71ec1e?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Hawa Mahal', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661559882-628d01b1b016?auto=format&fit=crop&q=80&w=800' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                JD
              </div>
              <div>
                <h3 className="font-bold text-gray-900">John Doe</h3>
                <p className="text-sm text-gray-500">Traveler</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Compass className="w-5 h-5" /> Overview
              </button>
              <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Calendar className="w-5 h-5" /> My Bookings
              </button>
              <button onClick={() => setActiveTab('saved')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'saved' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <BookMarked className="w-5 h-5" /> Saved Places
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Settings className="w-5 h-5" /> Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {activeTab === 'overview' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 transform transition hover:-translate-y-1">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">12</h3>
                  <p className="text-indigo-100">Saved Attractions</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 transform transition hover:-translate-y-1">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">3</h3>
                  <p className="text-teal-100">Upcoming Trips</p>
                </div>
                <div className="bg-gradient-to-br from-rose-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-200 transform transition hover:-translate-y-1">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">5</h3>
                  <p className="text-rose-100">Cities Explored</p>
                </div>
              </div>

              {/* Saved Attractions Preview */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recently Saved</h2>
                  <button onClick={() => setActiveTab('saved')} className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedAttractions.map(attr => (
                    <div key={attr.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={attr.img} alt={attr.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-rose-500">
                        <BookMarked className="w-5 h-5 fill-current" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{attr.name}</h3>
                        <p className="text-gray-500 flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4" /> {attr.city}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
             <div className="bg-white rounded-2xl shadow-sm p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
               <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No recent bookings found.</p>
               </div>
             </div>
          )}

          {activeTab === 'saved' && (
             <div className="bg-white rounded-2xl shadow-sm p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Places</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {savedAttractions.map(attr => (
                    <div key={attr.id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-indigo-100 transition-colors">
                      <img src={attr.img} alt={attr.name} className="w-24 h-24 rounded-xl object-cover" />
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-gray-900">{attr.name}</h3>
                        <p className="text-gray-500 text-sm">{attr.city}</p>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
