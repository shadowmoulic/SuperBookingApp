import { useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_EXP_IMAGE = "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800";

function ExperienceCard({ experience }) {
  const slug = experience.name ? experience.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : experience.public_id;
  const images = String(experience.image_url || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const showPrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link to={`/attraction/${slug}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col h-full">
        {/* Image Carousel Container */}
        <div className="relative w-full h-56 flex-shrink-0 overflow-hidden">
          <img
            src={images[currentImageIndex] || experience.image_url || FALLBACK_EXP_IMAGE}
            alt={experience.name}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
          />

          {/* Arrows — only if multiple images */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 text-lg font-bold transition-all"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 text-lg font-bold transition-all"
              >
                ›
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className="block rounded-full transition-all duration-200"
                    style={{
                      width: i === currentImageIndex ? "16px" : "6px",
                      height: "6px",
                      background:
                        i === currentImageIndex
                          ? "#fff"
                          : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex flex-row justify-between">
            <p className="text-sm text-gray-500 mb-1">{experience.city}</p>
            {experience.average_rating && (
              <p className="text-sm font-semibold flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span className="text-gray-700">{experience.average_rating}</span>
                <span className="text-gray-400 font-normal">({experience.total_reviews})</span>
              </p>
            )}
          </div>

          <h3 className="font-bold text-lg text-gray-900 leading-snug mb-4 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {experience.name}
          </h3>

          <div className="mt-auto">
            <span className="text-sm text-gray-500 block mb-0.5">from</span>
            <span className="font-bold text-xl">
              ₹{experience.entry_fee_base}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ExperienceCard;
