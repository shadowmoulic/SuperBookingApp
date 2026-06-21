import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search, ChevronDown, ChevronUp, Compass, Calendar } from "lucide-react";
import api from "../api/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200";

const fetchAllPages = async (initialUrl) => {
  let url = initialUrl;
  const items = [];

  while (url) {
    const response = await api.get(url);
    const data = response.data;

    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    if (Array.isArray(data?.results)) {
      items.push(...data.results);
      url = data.next;
      continue;
    }

    break;
  }

  return items;
};

const normalizeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function isMonthInBestTime(monthName, bestTimeStr) {
  if (!bestTimeStr) return true;
  const normalized = bestTimeStr.toLowerCase();
  if (
    normalized.includes("year round") ||
    normalized.includes("year-round") ||
    normalized.includes("all year") ||
    normalized.includes("anytime")
  ) {
    return true;
  }

  const shortMonth = monthName.substring(0, 3).toLowerCase();
  if (normalized.includes(shortMonth)) return true;

  const match = normalized.match(/([a-z]{3})\s*-\s*([a-z]{3})/);
  if (match) {
    const startMonth = match[1];
    const endMonth = match[2];
    const startIdx = MONTH_MAP[startMonth];
    const endIdx = MONTH_MAP[endMonth];
    const currentIdx = MONTH_MAP[shortMonth];

    if (startIdx !== undefined && endIdx !== undefined && currentIdx !== undefined) {
      if (startIdx <= endIdx) {
        return currentIdx >= startIdx && currentIdx <= endIdx;
      } else {
        return currentIdx >= startIdx || currentIdx <= endIdx;
      }
    }
  }
  return false;
}

const CITY_FAQS = [
  {
    question: "Which Indian cities offer the highest number of guided historical tours?",
    answer: "Historical hubs like Jaipur, New Delhi, Varanasi, and Agra feature the widest selection of curated monument visits, heritage walking tours, and local experiences on ZeQue."
  },
  {
    question: "How is the 'Best Time to Visit' determined for cities?",
    answer: "The ideal visiting window is calculated using seasonal weather trends. For instance, desert cities in Rajasthan are best during cooler months (November to February), while hill station cities are perfect to explore during summer (March to June)."
  },
  {
    question: "Can I book entry tickets for multiple attractions inside a city at once?",
    answer: "Yes, you can add multiple monument passes and local experience bookings within any city to your planner and complete checkout in one transaction, ensuring a smooth travel itinerary."
  },
  {
    question: "What is the policy for cancellation or rescheduling monument passes?",
    answer: "Standard ASI monument tickets booked via ZeQue offer flexible policies. You can view, download, or request adjustments to your passes directly from the 'My Bookings' section of your personal dashboard."
  }
];

const CityIndex = () => {
  const [cities, setCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentDate = now.getDate();
    const year = now.getFullYear();
    const daysInMonth = new Date(year, currentMonthIdx + 1, 0).getDate();

    // If we have less than 7 days left in the current month, select upcoming month
    if (daysInMonth - currentDate < 7) {
      return MONTHS[(currentMonthIdx + 1) % 12];
    }
    return MONTHS[currentMonthIdx];
  });
  const [visibleCount, setVisibleCount] = useState(6);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCities = async () => {
      setLoading(true);
      setError("");

      try {
        const items = await fetchAllPages("/api/cities/");
        setCities(items);
      } catch (err) {
        setError(err?.message || "Failed to load cities.");
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // SEO Page Info
  useEffect(() => {
    document.title = "Explore India City by City | Top Travel Attractions & Sightseeing | ZeQue";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Browse our extensive catalog of Indian cities. Discover local monuments, guided tours, best times to visit, and secure entry tickets online instantly."
      );
    }
  }, []);

  const filteredCities = useMemo(() => {
    let result = [...cities];

    // Sort by experience_count (descending) so cities with the most attractions show first
    result.sort((a, b) => (b.experience_count ?? 0) - (a.experience_count ?? 0));

    // Filter by selected month
    if (selectedMonth && selectedMonth !== "All") {
      result = result.filter((city) => {
        const bestTime = city["best-time"] || city.best_time || "";
        return isMonthInBestTime(selectedMonth, bestTime);
      });
    }

    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((city) => {
        return [city.name, city.slug, city.state, city["best-time"], city.best_time]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }

    return result;
  }, [searchQuery, cities, selectedMonth]);

  // Structured Data Schema
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          "name": "Popular Indian Cities to Visit",
          "description": "Browse and book entry tickets to top monuments and activities across leading travel cities in India.",
          "itemListElement": cities.slice(0, 6).map((city, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${window.location.origin}/city/${city.slug || normalizeSlug(city.name)}`,
            "name": city.name
          }))
        },
        {
          "@type": "FAQPage",
          "mainEntity": CITY_FAQS.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
      ]
    };
  }, [cities]);

  useEffect(() => {
    const existingScript = document.getElementById("city-index-structured-data");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "city-index-structured-data";
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("city-index-structured-data");
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [structuredData]);

  const visibleCities = useMemo(() => {
    return filteredCities.slice(0, visibleCount);
  }, [filteredCities, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setVisibleCount(6); // reset pagination when month changes
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen w-full relative pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container-low via-surface-container-lowest to-surface-container-lowest">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(19,107,85,0.06),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl text-center mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-sky-800 shadow-xs backdrop-blur-md">
              <MapPin className="h-4 w-4 text-sky-600" />
              City Directory
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl lg:text-6xl font-['Hanken_Grotesk']">
              Explore India, city by city.
            </h1>
            <p className="mt-5 text-base leading-8 text-on-surface-variant max-w-2xl mx-auto font-['Inter']">
              Discover unique cities teeming with cultural landmarks, bustling bazaars, and scenic views. Instantly find and reserve entry tickets to top sightseeing spots.
            </p>

            {/* Search Input */}
            <div className="mt-8 max-w-2xl mx-auto rounded-full bg-surface-container-low border border-outline-variant p-2 shadow-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center gap-3 bg-surface-container-lowest px-5 py-3.5 rounded-full">
                <Search className="h-5 w-5 text-on-surface-variant/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(6);
                  }}
                  placeholder="Search cities by name, state, or best season..."
                  className="w-full bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 font-['Inter']"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Month Filter Selector */}
      <section className="mx-auto max-w-7xl px-4 mb-12 sm:px-6 lg:px-8">
        <div className="bg-surface-container-low border border-outline-variant/40 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-['Hanken_Grotesk'] text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="text-sky-500 h-5 w-5" />
                Monthly Travel Planner
              </h2>
              <p className="text-sm text-on-surface-variant font-['Inter'] mt-1">
                Filter cities by their absolute best visiting season
              </p>
            </div>
            {selectedMonth !== "All" && (
              <button
                onClick={() => handleMonthSelect("All")}
                className="text-xs font-bold text-primary hover:underline self-start md:self-auto cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleMonthSelect("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-['Hanken_Grotesk'] transition-all cursor-pointer ${
                selectedMonth === "All"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-primary"
              }`}
            >
              All Year
            </button>
            {MONTHS.map((month) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(month)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-['Hanken_Grotesk'] transition-all cursor-pointer ${
                  selectedMonth === month
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-primary"
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cities List Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low px-6 py-20 text-center shadow-xs">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-primary" />
            <p className="mt-4 text-sm font-semibold text-on-surface-variant animate-pulse font-['Inter']">Retrieving city guides...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/20 px-6 py-16 text-center shadow-xs">
            <p className="text-sm font-semibold text-red-600 font-['Inter']">Failed to load cities: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-on-primary transition-all shadow-xs hover:brightness-105"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visibleCities.map((city) => {
                const citySlug = city.slug || normalizeSlug(city.name);
                const cityHref = `/city/${citySlug}`;
                const experienceCount = city.experience_count ?? 0;
                const bestTime = city["best-time"] || city.best_time || "Year round";

                return (
                  <Link
                    key={city.public_id || citySlug}
                    to={cityHref}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={city.image_url || city.icon_url || FALLBACK_IMAGE}
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-sm backdrop-blur-md">
                        <Compass className="h-3.5 w-3.5 text-emerald-600" />
                        {experienceCount} Experiences
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-200">
                          {city.state || "India"}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight font-['Hanken_Grotesk']">{city.name}</h2>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <p className="text-sm leading-6 text-on-surface-variant font-['Inter'] line-clamp-3">
                        {city.description || "Unveil ancient historical heritage sites, local culinary secrets, and vibrant outdoor excursions curated by local guides."}
                      </p>
                      <div className="mt-6 pt-5 border-t border-outline-variant/35 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Best time to visit
                          </p>
                          <p className="mt-1.5 text-xs font-bold text-on-surface font-['Inter']">{bestTime}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                          <ArrowRight className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More Button */}
            {filteredCities.length > visibleCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/50 hover:bg-primary/5 text-primary px-8 py-3 text-sm font-bold font-['Hanken_Grotesk'] transition-all shadow-xs cursor-pointer focus:outline-none"
                >
                  Load More Cities
                </button>
              </div>
            )}

            {filteredCities.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-20 text-center shadow-xs">
                <Search className="mx-auto h-12 w-12 text-on-surface-variant/30" />
                <h3 className="mt-4 text-lg font-bold text-on-surface font-['Hanken_Grotesk']">No cities found</h3>
                <p className="mt-2 text-sm text-on-surface-variant font-['Inter']">Try a different search term.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Switch Link Directory */}
      <div className="mx-auto flex max-w-7xl justify-center sm:justify-end px-4 mt-16 sm:px-6 lg:px-8">
        <Link
          to="/state"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/85 transition-colors font-['Hanken_Grotesk']"
        >
          View all states directory
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 mt-20 sm:px-6 lg:px-8">
        <h2 className="font-['Hanken_Grotesk'] text-[28px] font-bold text-primary text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {CITY_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-surface-container-low border border-outline-variant/40 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex justify-between items-center p-5 font-['Hanken_Grotesk'] font-bold text-on-surface hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-on-surface-variant shrink-0" />
                  )}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[250px] border-t border-outline-variant/20 p-5" : "max-h-0"
                  }`}
                >
                  <p className="text-sm leading-6 text-on-surface-variant font-['Inter']">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CityIndex;
