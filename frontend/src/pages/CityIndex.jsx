import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
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

const CityIndex = () => {
  const [cities, setCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return cities;

    return cities.filter((city) => {
      return [city.name, city.slug, city.state, city["best-time"], city.best_time]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [searchQuery, cities]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(19,107,85,0.12),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#f0f7fb_100%)] text-slate-900">
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-sky-700 shadow-sm backdrop-blur-md">
              <MapPin className="h-4 w-4" />
              City Directory
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Explore India city by city.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Browse the backend city catalog with state context, experience counts, and quick jumps into destination detail pages.
            </p>

            <div className="mt-8 max-w-2xl rounded-2xl bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cities by name, state, or best time"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-[#136b55]" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Loading cities...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm font-semibold text-red-600">Failed to load cities: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-[#136b55] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0c4c3b]"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCities.map((city) => {
                const citySlug = city.slug || normalizeSlug(city.name);
                const cityHref = `/city/${citySlug}`;
                const experienceCount = city.experience_count ?? 0;
                const bestTime = city["best-time"] || city.best_time || "Year round";

                return (
                  <Link
                    key={city.public_id || citySlug}
                    to={cityHref}
                    className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={city.image_url || city.icon_url || FALLBACK_IMAGE}
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-900 backdrop-blur-md">
                        <MapPin className="h-3.5 w-3.5 text-[#136b55]" />
                        {experienceCount} Experiences
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-100/90">
                          {city.state || "India"}
                        </p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{city.name}</h2>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <p className="text-sm leading-7 text-slate-600 line-clamp-2">
                        {city.description || "Discover city-level experiences curated from the backend catalog."}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">
                            Best time to visit
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{bestTime}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-slate-950 group-hover:text-white">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredCities.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <Search className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">No cities found</h3>
                <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>
              </div>
            )}
          </>
        )}
      </section>

      <div className="mx-auto flex max-w-7xl justify-end px-4 pb-8 sm:px-6 lg:px-8">
        <Link to="/state" className="text-sm font-semibold text-slate-500 transition-colors hover:text-[#136b55]">
          View states instead
        </Link>
      </div>
    </div>
  );
};

export default CityIndex;
