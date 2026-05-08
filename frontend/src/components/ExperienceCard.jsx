import { useState } from "react";
import { Link } from "react-router-dom";

function ExperienceCard({ experience }) {
  const experienceId = experience.public_id;
  const images = String(experience.image_url || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const showPrevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = (event) => {
    event.preventDefault();

    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link to={`/experience/${experienceId}`}>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col">
        {/* <div className="relative h-56 w-full"></div>
        <span className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded">
          Free cancellation
        </span> */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="experience-card__arrow experience-card__arrow--left"
              onClick={showPrevImage}
            >
              ‹
            </button>
            <button
              type="button"
              className="experience-card__arrow experience-card__arrow--right"
              onClick={showNextImage}
            >
              ›
            </button>
          </>
        )}
        <img
          src={images[currentImageIndex] || experience.image_url}
          alt={experience.name}
          className="w-full h-56 object-cover"
        />
        {/* </div> */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-gray-500">
              <p className="experience-card__location">{experience.location}</p>
            </span>
            <div className="flex items-center text-gray-700">
              {/* <svg
                className="w-4 h-4 text-yellow-400 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="font-bold mr-1">4.8</span> (1,200)
              */}
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4 text-gray-900 leading-snug overflow-hidden whitespace-nowrap overflow-ellipsis">
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

// <!-- Card 1 -->
//       <div
//         className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 flex flex-col">
//         <div className="relative h-56 w-full">
//             src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmNQJuOI-dPipQHzChRHlQNDNnrti2NTV9wca-7O9nHczfcjiAjotfixFNeijpAwWu3OY4yiO9QEeWERiGDaeyfUuw6p8M6-T3bswiYpOlWdhko6rLgORBgcu7W1ZVZRKXciPgsHyHJ28yAtVpJm_vB1Z8et9nHJCpj30VaNDCndxO0kAfQiS8cStf-6CEgBqUvTOFYoAKXLmuyrlTLc2qwv7rZY54pbmhvOex3HxmfFZT8bQ0Zph5HKr-i9dkeGMBFPkz8L8nTw" />
//         </div>
//         <div className="p-5 flex-1 flex flex-col">
//           <div className="flex justify-between items-center mb-1 text-sm">
//             <span className="text-gray-500">Colosseum</span>
//             <div className="flex items-center text-gray-700">
//               <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                 <path
//                   d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
//                 </path>
//               </svg>
//               <span className="font-bold mr-1">4.8</span> (1,200)
//             </div>
//           </div>
//           <h3 className="font-bold text-lg mb-4 text-gray-900 leading-snug">Rome: Colosseum, Roman Forum &amp; Palatine
//             Hill Tour</h3>
//           <div className="mt-auto">
//             <span className="text-sm text-gray-500 block mb-0.5">from</span>
//             <span className="font-bold text-xl">₹4,500</span>
//           </div>
//         </div>
//       </div>

// .experience-card__arrow {
//   position: absolute;
//   top: 50%;
//   transform: translateY(-50%);
//   z-index: 1;
//   width: 2.5rem;
//   height: 2.5rem;
//   border: none;
//   border-radius: 10%;
//   background: rgba(255, 255, 255, 0.6);
//   color: #333;
//   font-size: 1rem;
//   opacity: 0;
//   transition: opacity 0.2s ease;
// }

// .experience-card__arrow:focus {
//   outline: none;
// }

// .experience-card:hover .experience-card__arrow {
//   opacity: 1;
// }

// .experience-card__arrow--left {
//   left: 0.75rem;
// }

// .experience-card__arrow--right {
//   right: 0.75rem;
// }
