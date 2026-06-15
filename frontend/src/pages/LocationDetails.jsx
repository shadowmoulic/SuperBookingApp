import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import ExperienceCard from "../components/ExperienceCard";
import { MapPin, ChevronRight, Compass, ArrowLeft } from "lucide-react";

// Beautiful default fallback banners for cities if icon_url is missing
const CITY_FALLBACK_IMAGES = {
  kolkata: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=70",
  hyderabad: "https://images.unsplash.com/photo-1627471900135-e110757d54b5?auto=format&fit=crop&w=1200&q=70",
  delhi: "https://www.mistay.in/travel-blog/content/images/size/w2000/2020/06/cover-10.jpg",
  agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=70",
  jaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=70",
  hampi: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=1200&q=70",
  varanasi: "https://images.unsplash.com/photo-1561361062-8567535fde36?auto=format&fit=crop&w=1200&q=70"
};

export function LocationDetails() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Fetch city/location details
    api
      .get(`/api/city/${id}`)
      .then((res) => {
        setLocation(res.data);
        // Fetch experiences for this location
        return api.get(`/api/experiences/?location=${id}`);
      })
      .then((res) => {
        setExperiences(res.data.results || res.data || []);
      })
      .catch((err) => {
        console.error("Error loading location details:", err);
        setError("Could not load heritage site details. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading heritage city details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Location details could not be found."}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#136b55] hover:bg-[#0c4c3b] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const nameKey = location.name.toLowerCase();
  const bannerImage = location.icon_url || CITY_FALLBACK_IMAGES[nameKey] || CITY_FALLBACK_IMAGES["jaipur"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden">
        <img
          src={bannerImage}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />

        {/* Navigation & breadcrumb overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 max-w-7xl mx-auto w-full text-white">
          <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm mb-3">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-100 font-medium">Locations</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">{location.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            Explore {location.name}
          </h1>
          <p className="text-slate-200 text-xs sm:text-base mt-2 flex items-center gap-1.5 font-light">
            <MapPin className="w-4 h-4 text-amber-400" />
            Heritage Discovery Route &bull; India
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Monuments & Cultural Experiences
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select an experience to view timings, guidelines, and book instant entry tickets.
            </p>
          </div>
          <span className="mt-3 sm:mt-0 bg-emerald-50 text-[#136b55] text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-100 self-start">
            {experiences.length} Experiences Found
          </span>
        </div>

        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.public_id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm px-6 max-w-xl mx-auto">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No registered experiences yet</h3>
            <p className="text-slate-500 text-sm">
              We are currently mapping the monuments and booking channels for {location.name}. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
