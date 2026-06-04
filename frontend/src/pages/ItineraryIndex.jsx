import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

const ItineraryIndex = () => {
  const itineraries = [
    { title: "1 Day Jaipur", desc: "The ultimate short trip to the Pink City. Cover Amer Fort, Hawa Mahal, and Jantar Mantar.", days: 1 },
    { title: "2 Day Jaipur", desc: "A deeper dive into Jaipur's heritage. Includes Nahargarh sunset and local markets.", days: 2 },
    { title: "3 Day Kolkata", desc: "Experience the cultural capital. Victoria Memorial, Howrah Bridge, and authentic sweets.", days: 3 },
    { title: "5 Day Rajasthan", desc: "The Royal Rajasthan tour spanning Jaipur, Jodhpur, and Udaipur.", days: 5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Expert Itineraries</h1>
          <p className="text-xl text-gray-600">Perfectly planned trips to save you time. Choose an itinerary and start exploring.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {itineraries.map((itinerary, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-100">
              <div className="w-full sm:w-48 h-48 bg-emerald-50 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center text-[#136b55] group-hover:bg-[#136b55] group-hover:text-white transition-colors">
                <Calendar className="w-10 h-10 mb-2" />
                <span className="font-bold text-xl">{itinerary.days} Day{itinerary.days > 1 ? 's' : ''}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#136b55] transition-colors">{itinerary.title}</h2>
                <p className="text-gray-600 mb-4">{itinerary.desc}</p>
                <div className="mt-auto flex items-center gap-4 text-sm font-medium text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> Multiple Stops</span>
                  <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> Full Day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryIndex;
