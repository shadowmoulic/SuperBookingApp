import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { ChevronRight, Compass, MapPin, Clock, Globe, Star } from "lucide-react";

export default function CityPage() {
  const { id } = useParams();

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating");
  const [favorites, setFavorites] = useState({});
  const itemsPerPage = 8;

  useEffect(() => {
    loadCity();
  }, [id]);

  const loadCity = () => {
    setLoading(true);
    api
      .get(`/api/city/${id}`)
      .then((res) => {
        setCityData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching city data:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (cityData?.name) {
      document.title = cityData["SEO-title"] || `Explore ${cityData.name} | ZeQue`;
    }
  }, [cityData]);

  useEffect(() => {
    if (!cityData) return;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", cityData["SEO-description"] || "");
    }
  }, [cityData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const toggleFavorite = (e, expId) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [expId]: !prev[expId],
    }));
  };

  const experiencesList = cityData
    ? (Array.isArray(cityData.experiences)
      ? cityData.experiences
      : Array.isArray(cityData.experiences?.results)
        ? cityData.experiences.results
        : [])
    : [];

  const categories = [
    "All",
    ...new Set(experiencesList.flatMap((exp) => exp.category || [])),
  ];

  const filteredExperiences = selectedCategory === "All"
    ? experiencesList
    : experiencesList.filter((exp) => exp.category?.includes(selectedCategory));

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

  const paginatedExperiences = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedExperiences.slice(start, start + itemsPerPage);
  }, [sortedExperiences, currentPage]);

  const totalPages = Math.ceil(sortedExperiences.length / itemsPerPage) || 1;

  // Loading State
  if (loading) {
    return (
      <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant font-['Inter'] text-sm animate-pulse">Loading city data…</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !cityData) {
    return (
      <div className="bg-surface-container-lowest min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-on-surface font-['Inter'] text-sm font-semibold">{error || "City data not found"}</p>
        <button
          onClick={loadCity}
          className="mt-2 px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen w-full relative">
      <div className="mx-auto py-16 w-full relative">

        {/* ── HERO ───────────────────────────────────────────── */}
        <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
          <img
            src={cityData.image_url}
            alt={cityData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20" />

          {/* Overlay content */}
          <div className="absolute bottom-10 left-6 right-6 sm:left-12 max-w-7xl">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={13} />
              {cityData.state && (
                <>
                  <span className="hover:text-white transition-colors">{cityData.state}</span>
                  <ChevronRight size={13} />
                </>
              )}
              <span className="text-white font-semibold">{cityData.name}</span>
            </div>

            {/* City Name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Explore {cityData.name}
            </h1>

            {/* Description */}
            {cityData.description && (
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300 font-['Inter'] leading-relaxed">
                {cityData.description}
              </p>
            )}

            {/* Badges row */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {cityData["best-time"] && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm text-white font-['Inter']">
                  <Clock size={13} className="text-amber-400" />
                  Best Time: <span className="font-semibold text-amber-300">{cityData["best-time"]}</span>
                </span>
              )}
              {cityData.state && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm text-white font-['Inter']">
                  <MapPin size={13} className="text-primary" />
                  {cityData.state}
                </span>
              )}
              {cityData.website && (
                <a
                  href={cityData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/30 border border-primary/40 text-sm text-white hover:bg-primary/50 backdrop-blur-sm transition-all font-['Inter']"
                >
                  <Globe size={13} />
                  Official Tourism Site
                </a>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-3xl font-black text-primary">{cityData.experience_count ?? 0}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-['Inter'] mt-0.5">Experiences</p>
              </div>
              {cityData.average_rating && (
                <div>
                  <p className="text-3xl font-black text-amber-400 flex items-center gap-1">
                    <Star size={20} className="fill-amber-400" />
                    {Number(cityData.average_rating).toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-['Inter'] mt-0.5">Avg Rating</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">

          {/* City Info Cards — if additional meta fields exist */}
          {(cityData.highlights || cityData.known_for || cityData.language || cityData.timezone) && (
            <section className="mb-14 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
              {cityData.language && (
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Language</p>
                  <p className="font-['Hanken_Grotesk'] font-semibold text-on-surface text-sm">{cityData.language}</p>
                </div>
              )}
              {cityData.timezone && (
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Timezone</p>
                  <p className="font-['Hanken_Grotesk'] font-semibold text-on-surface text-sm">{cityData.timezone}</p>
                </div>
              )}
              {cityData.known_for && (
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 col-span-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Known For</p>
                  <p className="font-['Inter'] text-on-surface text-sm leading-relaxed">{cityData.known_for}</p>
                </div>
              )}
            </section>
          )}

          {/* ── EXPERIENCES SECTION ─────────────────────────── */}
          <section className="mb-16">
            {/* Section heading */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                  Explore Experiences
                </h2>
                <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                  Discover attractions, monuments and experiences in {cityData.name}.
                </p>
              </div>
              <span className="text-on-surface-variant font-['Inter'] text-sm hidden sm:block">
                {sortedExperiences.length} experience{sortedExperiences.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filter & Sort bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 py-5 border-y border-outline-variant/30">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full font-['Hanken_Grotesk'] font-semibold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary text-on-primary shadow-md"
                        : "bg-surface-container-low border border-outline-variant/50 hover:border-primary/40 hover:text-primary text-on-surface-variant"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-['Inter'] tracking-wider">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/50 text-on-surface font-['Hanken_Grotesk'] font-semibold text-sm focus:ring-0 cursor-pointer py-1.5 px-3 rounded-xl hover:border-primary/40 transition-colors focus:outline-none"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Experiences Grid */}
            {paginatedExperiences.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant animate-fade-in">
                <Compass className="mx-auto w-14 h-14 text-on-surface-variant/30 mb-4" />
                <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-on-surface mb-2">We're adding more experiences soon.</h3>
                <p className="text-on-surface-variant font-['Inter'] text-sm">Check back later for newly added attractions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 animate-fade-in">
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
                      to={`/attraction/${experience.slug}`}
                      key={expId}
                      className="group bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-outline-variant flex flex-col h-full relative cursor-pointer"
                    >
                      <div className="relative h-56 overflow-hidden flex-shrink-0">
                        <img
                          src={coverImage}
                          alt={experience.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                          onClick={(e) => toggleFavorite(e, expId)}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer"
                          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "#006b55" : "none"}
                            stroke={isFavorite ? "#006b55" : "currentColor"}
                            strokeWidth="2"
                            className="transition-colors text-gray-500"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        {experience.average_rating && (
                          <div className="absolute top-3 left-3 bg-surface-container-lowest/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-outline-variant/30 text-xs font-bold text-on-surface">
                            <span className="text-amber-400 text-xs leading-none">★</span>
                            <span className="font-['JetBrains_Mono'] leading-none">
                              {Number(experience.average_rating).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase font-['Inter'] tracking-wider mb-1.5 block">
                            {experience.category}
                          </span>
                          <h3 className="font-['Hanken_Grotesk'] font-bold text-on-surface text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 h-10">
                            {experience.name}
                          </h3>
                          <div className="flex items-center gap-1 text-on-surface-variant text-xs font-['Inter'] mb-4">
                            <span className="material-symbols-outlined text-xs leading-none">location_on</span>
                            <span>{experience.city || experience.location}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4 mt-auto">
                          <div>
                            <span className="text-[10px] text-on-surface-variant block font-['Inter'] uppercase tracking-wider mb-0.5">Starts from</span>
                            <span className="font-['JetBrains_Mono'] text-sm font-bold text-on-surface">
                              ₹{Number(experience.entry_fee_base).toFixed(2)}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-surface-container group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-outline-variant/30 mb-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 border border-outline-variant rounded-lg hover:bg-surface-container hover:border-primary/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-on-surface-variant cursor-pointer"
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
                      className={`w-9 h-9 rounded-lg font-['Hanken_Grotesk'] text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-on-primary shadow-sm"
                          : "border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:border-primary/40"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 border border-outline-variant rounded-lg hover:bg-surface-container hover:border-primary/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-on-surface-variant cursor-pointer"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            )}
          </section>

          {/* ── NEWSLETTER BANNER ───────────────────────────── */}
          <section className="bg-primary/5 rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 border border-primary/15">
            <div className="max-w-xl text-left">
              <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-primary mb-2">
                Stay Updated on Exhibits
              </h2>
              <p className="font-['Inter'] text-sm text-on-surface-variant leading-relaxed">
                Get notified about upcoming seasonal galleries, cultural exhibitions, and exclusive entry passes.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-6 py-4 rounded-xl font-['Hanken_Grotesk'] text-center">
                  🎉 Thank you for subscribing! We'll keep you in the loop.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3 flex-col sm:flex-row">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 lg:w-64 px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-surface-container-lowest text-on-surface text-sm font-['Inter'] placeholder-on-surface-variant/60"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-['Hanken_Grotesk'] font-semibold shadow-lg shadow-primary/20 hover:brightness-105 transition-all active:scale-98 cursor-pointer text-sm whitespace-nowrap"
                  >
                    Join Now
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
