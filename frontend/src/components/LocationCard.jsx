import { Link } from "react-router-dom";

function LocationCard({ location }) {
  return (
    <Link to={`/location/${location.public_id}`} className="block h-full">
      <div className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-48 md:h-56 w-full">

        {/* Background Image */}
        {location.icon_url ? (
          <img
            src={location.icon_url}
            alt={location.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-teal-500" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Text Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg leading-tight drop-shadow">
            {location.name}
          </h3>
          <p className="text-white/75 text-sm mt-0.5">India</p>
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </div>
    </Link>
  );
}

export default LocationCard;
