import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Search, ChevronDown, ChevronUp, Compass, ArrowRight, DollarSign } from "lucide-react";
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

const ATTRACTION_FAQS = [
  {
    question: "How do I book online entry tickets for monuments on ZeQue?",
    answer: "Simply find the attraction in our directory, select your date, time slot, and number of visitor passes, and complete the checkout process. You'll receive a verified digital pass with a QR code instantly."
  },
  {
    question: "Are the ticket prices on ZeQue same as official counter rates?",
    answer: "Yes, ZeQue lists official entry fees set by the Archaeological Survey of India (ASI) and local tourism boards, with no hidden booking commissions."
  },
  {
    question: "Do children require separate entry passes?",
    answer: "For most ASI national monuments, entry is free for children below the age of 15. However, state-managed palaces, museums, or botanical gardens may require separate child passes. Please check the specific attraction page details before booking."
  },
  {
    question: "Can I cancel or reschedule my attraction entry ticket?",
    answer: "Yes, ticket cancellation and rescheduling options depend on the specific monument guidelines. You can manage your active passes directly in the 'My Bookings' tab of your user dashboard."
  }
];

const AttractionIndex = () => {
  const [attractions, setAttractions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttractions = async () => {
      setLoading(true);
      setError("");

      try {
        const items = await fetchAllPages("/api/experiences/");
        setAttractions(items);
      } catch (err) {
        setError(err?.message || "Failed to load attractions.");
      } finally {
        setLoading(false);
      }
    };

    loadAttractions();
  }, []);

  // SEO Page Info
  useEffect(() => {
    document.title = "Explore Top Attractions & Monuments in India | ZeQue";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Search and book entry tickets for historical monuments, palaces, temples, and sightseeing attractions in India. Skip the queues with ZeQue."
      );
    }
  }, []);

  const filteredAttractions = useMemo(() => {
    let result = [...attractions];

    // Sort by rating (descending) so top-rated places show first
    result.sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));

    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((attr) => {
        return [attr.name, attr.city, attr.category, attr.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }

    return result;
  }, [searchQuery, attractions]);

  // Structured Data Schema
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          "name": "Popular Monuments and Sightseeing Spots in India",
          "description": "Book official entry tickets to skip the line at top cultural and historical monuments in India.",
          "itemListElement": attractions.slice(0, 6).map((attr, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${window.location.origin}/attraction/${attr.slug || normalizeSlug(attr.name)}`,
            "name": attr.name
          }))
        },
        {
          "@type": "FAQPage",
          "mainEntity": ATTRACTION_FAQS.map(faq => ({
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
  }, [attractions]);

  useEffect(() => {
    const existingScript = document.getElementById("attraction-index-structured-data");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "attraction-index-structured-data";
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("attraction-index-structured-data");
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [structuredData]);

  const visibleAttractions = useMemo(() => {
    return filteredAttractions.slice(0, visibleCount);
  }, [filteredAttractions, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen w-full relative pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container-low via-surface-container-lowest to-surface-container-lowest">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(19,107,85,0.06),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl text-center mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-emerald-800 shadow-xs backdrop-blur-md">
              <Compass className="h-4 w-4 text-emerald-600" />
              Sightseeing Directory
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl lg:text-6xl font-['Hanken_Grotesk']">
              Discover India's heritage.
            </h1>
            <p className="mt-5 text-base leading-8 text-on-surface-variant max-w-2xl mx-auto font-['Inter']">
              Search through our verified list of heritage sites, museums, palaces, and parks. Book entry tickets online, skip the line, and explore at your own pace.
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
                  placeholder="Search monuments, temples, museums by name, category, or city..."
                  className="w-full bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 font-['Inter']"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions List Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low px-6 py-20 text-center shadow-xs">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-primary" />
            <p className="mt-4 text-sm font-semibold text-on-surface-variant animate-pulse font-['Inter']">Retrieving attractions catalog...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/20 px-6 py-16 text-center shadow-xs">
            <p className="text-sm font-semibold text-red-600 font-['Inter']">Failed to load attractions: {error}</p>
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
              {visibleAttractions.map((attr) => {
                const attrSlug = attr.slug || normalizeSlug(attr.name);
                const attrHref = `/attraction/${attrSlug}`;
                const images = String(attr.image_url || "")
                  .split(",")
                  .map((url) => url.trim())
                  .filter(Boolean);
                const coverImage = images[0] || FALLBACK_IMAGE;
                const rating = attr.average_rating ? Number(attr.average_rating).toFixed(1) : "4.8";

                return (
                  <Link
                    key={attr.public_id || attr.id}
                    to={attrHref}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={coverImage}
                        alt={attr.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {rating}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200">
                          {attr.category || "Monument"}
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight font-['Hanken_Grotesk'] line-clamp-1">{attr.name}</h2>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <p className="text-sm leading-6 text-on-surface-variant font-['Inter'] line-clamp-3">
                        {attr.subtitle || attr.description || "Discover the fascinating architecture, legendary history, and cultural roots behind this unique attraction."}
                      </p>
                      <div className="mt-6 pt-5 border-t border-outline-variant/35 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-on-surface-variant/65" />
                          <span className="text-xs font-semibold text-on-surface font-['Inter']">{attr.city || "India"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/60">Tickets From</p>
                            <p className="text-sm font-black text-primary">₹{Math.round(Number(attr.entry_fee_base || 50))}</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                            <ArrowRight className="h-4.5 w-4.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More Button */}
            {filteredAttractions.length > visibleCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/50 hover:bg-primary/5 text-primary px-8 py-3 text-sm font-bold font-['Hanken_Grotesk'] transition-all shadow-xs cursor-pointer focus:outline-none"
                >
                  Load More Attractions
                </button>
              </div>
            )}

            {filteredAttractions.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-20 text-center shadow-xs">
                <Search className="mx-auto h-12 w-12 text-on-surface-variant/30" />
                <h3 className="mt-4 text-lg font-bold text-on-surface font-['Hanken_Grotesk']">No attractions found</h3>
                <p className="mt-2 text-sm text-on-surface-variant font-['Inter']">Try a different search query.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Switch Directory Links */}
      <div className="mx-auto flex max-w-7xl justify-center sm:justify-end px-4 mt-16 sm:px-6 lg:px-8 gap-4">
        <Link
          to="/state"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors font-['Hanken_Grotesk']"
        >
          States directory
        </Link>
        <span className="text-on-surface-variant/40">|</span>
        <Link
          to="/city"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors font-['Hanken_Grotesk']"
        >
          Cities directory
        </Link>
      </div>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 mt-20 sm:px-6 lg:px-8">
        <h2 className="font-['Hanken_Grotesk'] text-[28px] font-bold text-primary text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {ATTRACTION_FAQS.map((faq, idx) => {
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

export default AttractionIndex;
