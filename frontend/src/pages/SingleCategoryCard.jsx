import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function SingleCategoryPage() {
  const { id } = useParams();

  const [category, setCategory] = useState(null);

  useEffect(() => {
    const categoryData = {
      1: {
        name: "Museums",
        banner:
          "https://images.unsplash.com/photo-1566127992631-137a642a90f4?q=80&w=1200&auto=format&fit=crop",

        places: [
          {
            id: 1,
            name: "Louvre Museum",
            image:
              "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1200&auto=format&fit=crop",
            rating: 4.8,
            reviews: 1200,
            description: "World-famous museum with historical masterpieces.",
          },
        ],
      },

      2: {
        name: "Temples",
        banner:
          "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop",

        places: [
          {
            id: 1,
            name: "Golden Temple",
            image:
              "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1200&auto=format&fit=crop",
            rating: 4.9,
            reviews: 2400,
            description:
              "Beautiful spiritual destination with peaceful atmosphere.",
          },
        ],
      },

      3: {
        name: "Zoos",
        banner:
          "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",

        places: [
          {
            id: 1,
            name: "National Zoo",
            image:
              "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
            rating: 4.7,
            reviews: 900,
            description: "Experience wildlife and amazing animal adventures.",
          },
        ],
      },
    };

    setCategory(categoryData[id]);
  }, [id]);
  if (!category) {
    return <div className="text-center py-20 text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* HERO SECTION */}
      <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] overflow-hidden">
        {/* Background Image */}
        <img
          src={category.banner}
          alt={category.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 pb-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            {category.name}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-200 max-w-full sm:max-w-2xl">
            Discover amazing places, experiences, reviews, and unforgettable
            adventures.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-12 py-10">
        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">Popular Places</h2>
        </div>

        {/* PLACES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {category.places.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-500"
            >
              {/* IMAGE */}
              <div className="h-[220px] sm:h-[240px] overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover hover:scale-110 transition duration-700"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                {/* TITLE + RATING */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {place.name}
                  </h3>

                  <span className="bg-yellow-400 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    ⭐ {place.rating}
                  </span>
                </div>

                {/* REVIEWS */}
                <p className="text-gray-500 mt-2 text-sm">
                  {place.reviews} Reviews
                </p>

                {/* DESCRIPTION */}
                <p className="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">
                  {place.description}
                </p>

                {/* BUTTON */}
                <button className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition">
                  Explore Place
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SingleCategoryPage;
