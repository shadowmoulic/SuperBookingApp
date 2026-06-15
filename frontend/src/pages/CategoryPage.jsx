import { useEffect, useState, useMemo, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";
import LocationContext from "../context/LocationContext";

const ALL_CATEGORIES = [
  { id: 1, name: "Museum" },
  { id: 2, name: "Garden" },
  { id: 3, name: "Zoo" },
  { id: 4, name: "Amusement Park" },
  { id: 5, name: "Landmark" },
  { id: 6, name: "Religious Site" },
  { id: 7, name: "Theme Park" }
];

const findCategoryBySlug = (slug) => {
  if (!slug || slug.toLowerCase() === "all") return "All";

  const normalizedSlug = slug.toLowerCase().replace(/-/g, " ");

  const matched = ALL_CATEGORIES.find(cat => {
    const catNameLower = cat.name.toLowerCase();
    if (catNameLower === normalizedSlug) return true;
    if (normalizedSlug.endsWith("s") && catNameLower === normalizedSlug.slice(0, -1)) return true;
    if (catNameLower.endsWith("s") && catNameLower.slice(0, -1) === normalizedSlug) return true;
    return false;
  });

  return matched ? matched.name : "All";
};

const resolveLocationFromSlug = (slug, locationsList = []) => {
  if (!slug || slug.toLowerCase() === "all") return "All";

  if (locationsList.length > 0) {
    const matched = locationsList.find(
      (loc) => loc.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase().replace(/\s+/g, "-")
    );
    if (matched) return matched.name;
  }

  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function CategoryPage({ type }) {
  const { locationName, categoryName } = useParams();
  const navigate = useNavigate();
  const { locations } = useContext(LocationContext);

  const [activeLocation, setActiveLocation] = useState(() =>
    resolveLocationFromSlug(locationName, locations)
  );
  const [activeCategory, setActiveCategory] = useState(() =>
    findCategoryBySlug(categoryName)
  );

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [subFilter, setSubFilter] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Favorites state (client-side toggle)
  const [favorites, setFavorites] = useState({});

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  // Sync filters from URL parameters on mount or when params change
  useEffect(() => {
    if (locations.length === 0) return;

    const resolvedLoc = resolveLocationFromSlug(locationName, locations);
    const resolvedCat = findCategoryBySlug(categoryName);
    setActiveLocation(resolvedLoc);
    setActiveCategory(resolvedCat);
  }, [locationName, categoryName, locations]);

  const handleCategoryChange = (catName) => {
    const locSlug = activeLocation === "All" ? "" : activeLocation.toLowerCase().replace(/\s+/g, "-");
    const catSlug = catName === "All" ? "" : catName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${locSlug}/${catSlug}`);
  };

  // Fetch experiences based on dynamic filters
  useEffect(() => {
    console.log("CategoryPage Fetch Effect Triggered:", { activeLocation, activeCategory });
    const fetchExperiences = async () => {
      setLoading(true);
      setError("");
      try {
        const locQuery = activeLocation === "All" ? "" : activeLocation;
        const catQuery = activeCategory === "All" ? "" : activeCategory;

        const url = `/api/experiences/?location=${locQuery}&category=${catQuery}`;
        console.log("CategoryPage Fetching experiences from URL:", url);
        const res = await api.get(url);
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setExperiences(data);
      } catch (err) {
        console.error("Error fetching experiences:", err);
        setError("Unable to load experiences.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [activeLocation, activeCategory]);

  // Reset page number on filter changes
  useEffect(() => {
    console.log("CategoryPage Reset Page Effect Triggered:", { activeLocation, activeCategory, subFilter });
    setCurrentPage(1);
  }, [activeLocation, activeCategory, subFilter]);

  const toggleFavorite = (e, expId) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [expId]: !prev[expId],
    }));
  };

  // Sub-filtering based on search tag terms in titles/descriptions
  const filteredExperiences = useMemo(() => {
    let list = experiences;
    if (subFilter === "Art & History") {
      list = list.filter((exp) =>
        /art|history|museum|memorial|paint|culture/i.test(exp.name + " " + (exp.description || "")),
      );
    } else if (subFilter === "Science & Tech") {
      list = list.filter((exp) =>
        /science|tech|space|birla|planetarium/i.test(exp.name + " " + (exp.description || "")),
      );
    } else if (subFilter === "Memoirs") {
      list = list.filter((exp) =>
        /bhawan|house|home|netaji|tagore|memorial/i.test(exp.name + " " + (exp.description || "")),
      );
    }
    return list;
  }, [experiences, subFilter]);

  // Sorting logic
  const sortedExperiences = useMemo(() => {
    const list = [...filteredExperiences];
    if (sortBy === "price_asc") {
      list.sort((a, b) => Number(a.entry_fee_base) - Number(b.entry_fee_base));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => Number(b.entry_fee_base) - Number(a.entry_fee_base));
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));
    }
    return list;
  }, [filteredExperiences, sortBy]);

  // Paginated experiences
  const paginatedExperiences = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedExperiences.slice(start, start + itemsPerPage);
  }, [sortedExperiences, currentPage]);

  const totalPages = Math.ceil(sortedExperiences.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 w-full relative animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col mb-12">
          <div className="h-3 w-40 bg-gray-200 skeleton rounded mb-4" />
          <div className="h-10 w-72 bg-gray-200 skeleton rounded mb-4" />
          <div className="h-5 w-full bg-gray-200 skeleton rounded" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-12 w-full bg-gray-200 skeleton rounded-full mb-8" />

        {/* Experience Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
              <div className="h-64 bg-gray-200 skeleton w-full" />
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="h-6 w-full bg-gray-200 skeleton rounded" />
                <div className="h-3 w-20 bg-gray-200 skeleton rounded mb-4" />
                <div className="h-10 w-full bg-gray-200 skeleton rounded mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 w-full relative">

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col mb-8">
        <nav className="flex items-center gap-1.5 mb-4 text-gray-400 font-semibold text-[10px] uppercase tracking-wider font-['Inter']">
          <Link to="/" className="hover:text-primary transition-colors">Destinations</Link>
          <span className="text-gray-300">/</span>
          <span>India</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{activeLocation}</span>
          {activeCategory !== "All" && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-primary">{activeCategory}</span>
            </>
          )}
        </nav>
        <h1 className="font-['Hanken_Grotesk'] text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {activeCategory === "All" ? "All Experiences" : activeCategory} in {activeLocation === "All" ? "India" : activeLocation}
        </h1>
        <p className="font-['Inter'] text-sm sm:text-base text-gray-500 max-w-2xl leading-relaxed font-normal">
          Explore curated tours, tickets, and entry passes for the best experiences.
        </p>
      </div>

      {/* Pill Filter Row (Categories) */}
      <div className="mb-8">
        <span className="text-xs font-bold text-gray-400 uppercase font-['Inter'] tracking-wider block mb-2">Categories:</span>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-wrap">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold font-['Hanken_Grotesk'] whitespace-nowrap cursor-pointer transition-all duration-300 ${activeCategory === "All"
              ? "bg-primary border-primary text-white shadow-xs"
              : "bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
          >
            All Categories
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold font-['Hanken_Grotesk'] whitespace-nowrap cursor-pointer transition-all duration-300 ${activeCategory === cat.name
                ? "bg-primary border-primary text-white shadow-xs"
                : "bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Sorting Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 py-6 border-y border-gray-150">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "All Types", key: "All", icon: "filter_list" },
            { label: "Art & History", key: "Art & History" },
            { label: "Science & Tech", key: "Science & Tech" },
            { label: "Memoirs", key: "Memoirs" },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setSubFilter(pill.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold font-['Hanken_Grotesk'] transition-all duration-300 cursor-pointer ${subFilter === pill.key
                ? "border-primary bg-primary/5 text-primary shadow-xs"
                : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                }`}
            >
              {pill.icon && (
                <span className="material-symbols-outlined text-sm leading-none">{pill.icon}</span>
              )}
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-gray-400 uppercase font-['Inter'] tracking-wider">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border-none text-gray-700 font-bold focus:ring-0 cursor-pointer text-sm font-['Hanken_Grotesk'] py-1 px-2 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {paginatedExperiences.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-250 mb-16 animate-fade-in">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">sentiment_dissatisfied</span>
          <p className="text-gray-500 font-['Inter'] text-sm">No experiences found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16 animate-fade-in">
          {paginatedExperiences.map((experience) => {
            const expId = experience.public_id || experience.id;
            const images = String(experience.image_url || "")
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean);
            const coverImage = images[0] || experience.image_url;
            const isFavorite = !!favorites[expId];

            return (
              <Link
                to={`/attraction/${slug}`}
                key={expId}
                className="group bg-white border-gray-150 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full relative cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={experience.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={(e) => toggleFavorite(e, expId)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isFavorite ? "var(--md-sys-color-primary)" : "none"}
                      stroke={isFavorite ? "var(--md-sys-color-primary)" : "currentColor"}
                      strokeWidth="2"
                      className="transition-colors text-gray-550"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  {experience.average_rating && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-gray-50 text-xs font-bold text-gray-800">
                      <span className="text-yellow-400 font-sans text-xs leading-none">★</span>
                      <span className="font-['JetBrains_Mono'] leading-none">
                        {Number(experience.average_rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase font-['Inter'] tracking-wider mb-1.5 block">
                      {experience.category}
                    </span>
                    <h3 className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 h-10">
                      {experience.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-['Inter'] mb-6">
                      <span className="material-symbols-outlined text-xs leading-none">location_on</span>
                      <span>{experience.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-50 pt-4 mt-auto">
                    <div>
                      <span className="text-[10px] text-gray-450 block font-['Inter'] uppercase tracking-wider mb-0.5">Starts from</span>
                      <span className="font-['JetBrains_Mono'] text-sm font-bold text-gray-900">
                        ₹{Number(experience.entry_fee_base).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination wrapper */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-gray-100 mb-12">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-500 cursor-pointer"
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-lg font-['Hanken_Grotesk'] text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${isActive
                  ? "bg-primary text-white shadow-xs"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-500 cursor-pointer"
            aria-label="Next page"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      )}

      {/* Newsletter Subscription Banner */}
      <div className="bg-primary/5 rounded-2xl p-10 flex flex-col lg:flex-row items-center justify-between gap-10 mb-16 border border-primary/10">
        <div className="max-w-xl text-left">
          <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-primary mb-2">
            Stay Updated on Exhibits
          </h2>
          <p className="font-['Inter'] text-sm text-gray-500 leading-relaxed font-normal">
            Get notified about upcoming seasonal galleries, cultural exhibitions, and exclusive entry passes.
          </p>
        </div>

        <div className="w-full lg:w-auto">
          {subscribed ? (
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-6 py-4 rounded-xl font-['Hanken_Grotesk'] text-center">
              🎉 Thank you for subscribing! We'll keep you in the loop.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-4 flex-col sm:flex-row">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 lg:w-64 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white text-sm font-['Inter'] font-normal"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all active:scale-98 cursor-pointer text-sm whitespace-nowrap"
              >
                Join Now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
