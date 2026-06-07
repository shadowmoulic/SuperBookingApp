import React from 'react';
import { Link } from 'react-router-dom';

const CITY_STATS = {
  delhi: [{ label: "Heritage Sites", value: "24+" }, { label: "Monuments", value: "174" }, { label: "Museums", value: "40+" }],
  agra: [{ label: "Attractions", value: "8+" }, { label: "UNESCO Sites", value: "3" }, { label: "Mughal Sites", value: "6" }],
  jaipur: [{ label: "Attractions", value: "34+" }, { label: "Forts", value: "12" }, { label: "UNESCO Sites", value: "3" }],
  kolkata: [{ label: "Heritage Sites", value: "28+" }, { label: "Museums", value: "9" }, { label: "Colonial Trails", value: "4" }],
  hyderabad: [{ label: "Attractions", value: "12+" }, { label: "Nizam Palaces", value: "7" }, { label: "Museums", value: "8" }],
  mumbai: [{ label: "Attractions", value: "14+" }, { label: "Colonial Sites", value: "8" }, { label: "Art Galleries", value: "12" }],
  udaipur: [{ label: "Attractions", value: "10+" }, { label: "Palaces", value: "6" }, { label: "Lake Views", value: "4" }],
  varanasi: [{ label: "Ghats", value: "84" }, { label: "Temples", value: "23,000+" }, { label: "Spiritual Sites", value: "14" }],
  mysore: [{ label: "Attractions", value: "7+" }, { label: "Palaces", value: "3" }, { label: "Heritage Sites", value: "9" }],
  hampi: [{ label: "Ruins", value: "100+" }, { label: "UNESCO Sites", value: "1" }, { label: "Temple Complexes", value: "11" }],
};

function LocationBentoCard({ location }) {
  const stats = location.stats || CITY_STATS[location.name.toLowerCase()] || [];

  return (
    <Link to={`/${location.name.toLowerCase().replace(/\s+/g, '-')}`} className="block h-full">
      <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-72 md:h-80 w-full">
        {/* Background Image */}
        {location.icon_url ? (
          <img
            src={location.icon_url}
            alt={location.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa] to-[#006b55]" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 className="font-['Hanken_Grotesk'] font-bold text-[#fff] text-xl md:text-2xl leading-tight drop-shadow">
            {location.name}
          </h3>
          <p className="text-[#fff]/80 font-['Inter'] text-sm mt-1">India</p>
          
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[#fff] font-bold text-xs">{s.value}</p>
                  <p className="text-slate-350 text-[9px] leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default LocationBentoCard;
