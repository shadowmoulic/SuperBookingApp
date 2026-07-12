import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Share2, MapPin, Star, Clock, Zap, Award, Gauge, Ticket,
  CheckCircle2, CreditCard, Shirt, CameraOff, Plus, Minus, ArrowRight, ShieldAlert,
  Calendar, Flame, HelpCircle
} from "lucide-react";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

const FALLBACK_EXP_IMAGE = "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800";

export function ExperienceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("indian");
  const [indianCount, setIndianCount] = useState(1);
  const [foreignerCount, setForeignerCount] = useState(0);

  const handleIndianCountChange = (delta) => {
    setIndianCount((current) => Math.max(0, current + delta));
  };

  const handleForeignerCountChange = (delta) => {
    setForeignerCount((current) => Math.max(0, current + delta));
  };

  // Date Generator for next 7 days (used in the booking flow)
  const dates = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: date.toLocaleDateString("en-US", { day: "numeric" }),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        iso: date.toISOString().slice(0, 10),
        isToday: index === 0,
      };
    });
  }, []);

  useEffect(() => {
    if (id) {
      getItem();
    }
  }, [id]);

  const getItem = () => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${id}`)
      .then((res) => {
        setExperience(res.data);
        
        // Add to recently explored
        const item = {
          type: "attraction",
          name: res.data.name,
          image: res.data.image_url ? res.data.image_url.split(",")[0].trim() : "",
          url: `/attraction/${id}`,
          subtitle: `Attraction in ${res.data.city || "India"}`
        };
        try {
          const list = JSON.parse(localStorage.getItem("recently_explored") || "[]");
          const filtered = list.filter(x => x.url !== item.url);
          filtered.unshift(item);
          localStorage.setItem("recently_explored", JSON.stringify(filtered.slice(0, 4)));
        } catch (e) {}
      })
      .catch((err) => {
        setError("Unable to load experience details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Mobile sticky scroll listener removed because booking metadata now lives on BookingPage.

  const images = useMemo(() => {
    return String(experience?.image_url || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }, [experience]);

  const ticketPrices = useMemo(() => {
    let indianPrice = 45;
    let foreignerPrice = 1050;

    if (experience && Array.isArray(experience.ticket_types)) {
      const indianType = experience.ticket_types.find(tt =>
        tt.name.toLowerCase().includes("india") || tt.name.toLowerCase().includes("local")
      );
      const foreignerType = experience.ticket_types.find(tt =>
        tt.name.toLowerCase().includes("foreign") || tt.name.toLowerCase().includes("intl") || tt.name.toLowerCase().includes("international")
      );

      if (indianType) {
        const activeRule = indianType.pricing_rules?.find(pr => pr.is_active || pr.final_price);
        if (activeRule) {
          indianPrice = Number(activeRule.final_price);
        }
      } else if (experience.entry_fee_base) {
        indianPrice = Number(experience.entry_fee_base);
      }

      if (foreignerType) {
        const activeRule = foreignerType.pricing_rules?.find(pr => pr.is_active || pr.final_price);
        if (activeRule) {
          foreignerPrice = Number(activeRule.final_price);
        }
      } else {
        foreignerPrice = indianPrice * 23.33;
      }
    } else if (experience && experience.entry_fee_base) {
      indianPrice = Number(experience.entry_fee_base);
      foreignerPrice = indianPrice * 23.33;
    }

    return { indian: Math.round(indianPrice), foreigner: Math.round(foreignerPrice) };
  }, [experience]);

  const reviewsList = useMemo(() => {
    if (!experience) return [];
    if (Array.isArray(experience.reviews)) {
      return experience.reviews;
    }
    if (Array.isArray(experience.reviews?.results)) {
      return experience.reviews.results;
    }
    return [];
  }, [experience]);

  const totalTickets = indianCount + foreignerCount;
  const totalPrice = (indianCount * ticketPrices.indian) + (foreignerCount * ticketPrices.foreigner);

  const handleBuyNow = () => {
    navigate(`/attraction/${id}/booking`);
  };

  

  if (loading || !experience) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-['Sora']">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow text-center">
          <h2 className="text-xl font-bold text-on-surface mb-2">Error</h2>
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen w-full relative">
      <div className="mx-auto py-16 w-full relative"></div>
      <div className="lg:hidden">
        {/* Hero Section */}
        <section className="relative w-full h-[50vh] sm:h-[60vh] min-h-[350px] overflow-hidden">
          <img
            alt={experience?.name || "Experience Banner"}
            className="w-full h-full object-cover"
            src={images[0] || experience.image_url || FALLBACK_EXP_IMAGE}
            onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
            fetchpriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="bg-primary text-on-primary text-[9px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase shadow-xs">
                  Instant Confirmation
                </span>
                <div className="flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded font-black text-[10px]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{Number(experience.average_rating || 5.0).toFixed(1)} ({experience.total_reviews || 0})</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold mb-1.5 leading-tight tracking-tight">
                {experience.name}
              </h2>
              <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white" /> {experience.address || `${experience.city}, India`}
              </p>
            </div>
          </div>
        </section>

        {/* Urgency Scarcity Banner */}
        <div className="bg-error-container text-on-error-container px-4 sm:px-8 py-3 flex items-center gap-3 shadow-xs">
          <Zap className="w-5 h-5 animate-pulse shrink-0" />
          <p className="text-xs sm:text-sm font-bold">
            Selling Fast: <span className="font-extrabold">85% of tickets</span> for tomorrow are already booked.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="px-4 sm:px-8 py-8 space-y-8">

          {/* Pricing cards */}
          <section id="pricing-cards-section" className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs">
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Indian National</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">₹{ticketPrices.indian}</span>
                <span className="text-[10px] text-on-surface-variant/70 font-bold">/ guest</span>
              </div>
            </div>
            <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs">
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Foreigner</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">₹{ticketPrices.foreigner}</span>
                <span className="text-[10px] text-on-surface-variant/70 font-bold">/ guest</span>
              </div>
            </div>
          </section>

          {/* Value Props Row */}
          <section className="flex justify-between overflow-x-auto hide-scrollbar gap-4 py-2 border-b border-outline-variant/30 pb-6">
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-on-surface-variant">Free<br />Cancellation</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-on-surface-variant">Authorized<br />Partner</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-on-surface-variant">Fast-track<br />Entry</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-on-surface-variant">Mobile<br />Tickets</span>
            </div>
          </section>

          {/* What's Included */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-on-surface">What's Included</h3>
            <ul className="space-y-3 font-semibold text-xs sm:text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Skip-the-line entrance to the main complex</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Access to the Mausoleum (Optional Add-on)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Access to Mosque and Museum</span>
              </li>
            </ul>
          </section>

          {experience.image_sunrise && (
            <>
              {/* Why Sunrise Editorial */}
              <section className="bg-surface-container -mx-4 sm:-mx-8 px-4 sm:px-8 py-8 rounded-3xl">
                <h3 className="text-lg font-black text-on-surface mb-3">Why visit at Sunrise?</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-semibold mb-6">
                  Witnessing the ivory-white marble turn shades of soft pink and gold is a once-in-a-lifetime experience. At sunrise, the crowds are thinnest, the air is crisp, and the reflection in the Yamuna River is most serene.
                </p>
                <div className="h-64 rounded-2xl overflow-hidden shadow-xs relative">
                  <img
                    alt={`${experience.name} Sunrise`}
                    className="w-full h-full object-cover"
                    src={experience.image_sunrise || FALLBACK_EXP_IMAGE}
                    onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
                  />
                </div>
              </section>
            </>
          )}
          {/* Bento Pro Tips */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-on-surface">Pro Tips</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center text-center shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary mb-2 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-on-surface mb-1">Carry ID</p>
                <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">A valid original government ID is mandatory for entry.</p>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center text-center shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary mb-2 shadow-xs">
                  <Shirt className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-on-surface mb-1">Dress Code</p>
                <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">Shoes must be removed at the mausoleum entrance.</p>
              </div>
              <div className="col-span-2 p-5 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center text-center gap-3 shadow-2xs">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-xs shrink-0">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface mb-0.5">Pro Cameras Restricted</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">Tripods and professional lighting require prior written permission.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Traveler Reviews */}
          {reviewsList.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-on-surface">Traveler Reviews</h3>
              <div className="space-y-4">
                {reviewsList.map((review) => (
                  <div key={review.id} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs">
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {review.user_name ? review.user_name.charAt(0) : "U"}
                        </div>
                        <span className="text-xs font-bold text-on-surface">{review.user_name}</span>
                      </div>
                      <div className="flex text-tertiary">
                        {"★".repeat(review.rating || 5)}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-semibold">
                      "{review.review_text}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Persistent Bottom Mobile Footer */}
        <footer className="fixed bottom-0 left-0 w-full z-45 bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider">Starting from</span>
            <span className="text-xl font-extrabold text-primary">₹{ticketPrices.indian}</span>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={!experience.is_open}
            className="bg-primary hover:brightness-110 text-on-primary px-10 py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:bg-outline-variant/40 disabled:text-on-surface-variant/40 disabled:cursor-not-allowed"
          >
            {experience.is_open ? "Book Now" : "Coming Soon"}
          </button>
        </footer>

        
      </div>

      {/* -------------------- DESKTOP LAYOUT (attr-desc.txt) -------------------- */}
      <div className="hidden lg:block max-w-[1280px] mx-auto px-6 py-8">

        {/* Breadcrumb & Title Section */}
        <div className="mb-8">
          <nav className="flex gap-1.5 text-on-surface-variant font-semibold text-xs mb-2 uppercase tracking-wider">
            <Link className="hover:text-primary transition-colors" to="/">India</Link>
            <span>/</span>
            {experience.city && (
              <>
                <Link className="hover:text-primary transition-colors" to={`/city/${experience.city.toLowerCase().replace(/\s+/g, '-')}`}>{experience.city}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-on-surface font-bold">{experience.name}</span>
          </nav>

          <div className="flex justify-between items-end gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface mb-1.5">{experience.name}</h1>
              <div className="flex items-center gap-4 text-on-surface-variant text-sm font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {experience.address || `${experience.city}, India`}
                </span>
                <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                <span className="flex items-center gap-1 text-primary font-extrabold">
                  <Zap className="w-4 h-4" />
                  Instant Confirmation
                </span>
              </div>
            </div>

            {experience.average_rating && (
              <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full">
                <div className="flex items-center text-tertiary-container">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-on-surface ml-1">{Number(experience.average_rating).toFixed(1)}</span>
                </div>
                <span className="text-on-surface-variant text-xs font-semibold">({experience.total_reviews} Reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

          {/* Left Columns (Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Immersive Gallery */}
            <section className="grid grid-cols-12 grid-rows-2 gap-4 h-[500px]">
              <div className="col-span-8 row-span-2 relative overflow-hidden rounded-2xl group cursor-pointer border border-outline-variant/30">
                <img
                  alt={experience?.name || "Experience Main Image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  src={images[0] || experience.image_url || FALLBACK_EXP_IMAGE}
                  onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
                  fetchpriority="high"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="col-span-4 row-span-1 overflow-hidden rounded-2xl group cursor-pointer border border-outline-variant/30">
                <img
                  alt={experience?.name || "Experience Detail Image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={images[1] || images[0] || experience.image_url || FALLBACK_EXP_IMAGE}
                  onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
                />
              </div>
              <div className="col-span-4 row-span-1 relative overflow-hidden rounded-2xl group cursor-pointer border border-outline-variant/30">
                <img
                  alt={experience?.name || "Experience Detail Image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={images[2] || images[0] || experience.image_url || FALLBACK_EXP_IMAGE}
                  onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-xs font-black border border-white px-4 py-2 rounded-lg">View All Photos</span>
                </div>
              </div>
            </section>

            {/* What's Included */}
            <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
              <h2 className="text-lg font-black text-on-surface mb-6">What's Included</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-on-surface font-extrabold">Skip-the-line Admission</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Priority entry through the dedicated fast-track gate.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-on-surface font-extrabold">Mausoleum Access</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Entrance to the central inner tomb of Mumtaz Mahal & Shah Jahan.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-on-surface font-extrabold">Mosque & Guest House</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Access to the red sandstone peripheral structures.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-on-surface font-extrabold">Taj Museum Entry</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">View original architectural drawings and Mughal artifacts.</p>
                  </div>
                </li>
              </ul>
            </section>

            {experience.image_sunrise && (
              <>
                {/* Why Visit at Sunrise */}
                <section className="py-4">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/2 space-y-4">
                      <h2 className="text-lg font-black text-on-surface">Why Visit at Sunrise?</h2>
                      <p className="text-sm text-on-surface-variant font-semibold leading-relaxed">
                        Witnessing the Taj Mahal at dawn is a spiritual experience. As the first rays of the sun hit the semi-translucent white marble, the monument transforms from a soft grey-blue to a vibrant, glowing gold. This "Editorial Hour" offers the best photography light and significantly thinner crowds, allowing for a moment of quiet contemplation in the shadow of eternal love.
                      </p>
                      <div className="flex gap-4 pt-2">
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex-1">
                          <span className="block text-xl font-black text-primary mb-1">05:30</span>
                          <span className="text-[10px] text-on-surface-variant font-bold">Recommended Arrival</span>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex-1">
                          <span className="block text-xl font-black text-primary mb-1">85%</span>
                          <span className="text-[10px] text-on-surface-variant font-bold">Fewer Crowds</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <img
                        alt="Sunrise at Taj"
                        className="rounded-2xl border border-outline-variant/30 shadow-sm w-full h-[280px] object-cover"
                        src={experience.image_sunrise || FALLBACK_EXP_IMAGE}
                        onError={(e) => { e.target.src = FALLBACK_EXP_IMAGE; }}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}
            {/* Pro Tips Section */}
            <section className="space-y-6">
              <h2 className="text-lg font-black text-on-surface">Pro Tips for Your Visit</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 hover:border-primary transition-all flex flex-col items-center text-center shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary mb-4 shadow-sm">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-on-surface mb-2">Valid ID</h3>
                  <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">All visitors must carry an original passport or government-issued ID card matching the booking name.</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 hover:border-primary transition-all flex flex-col items-center text-center shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary mb-4 shadow-sm">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-on-surface mb-2">Dress Code</h3>
                  <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">Modest clothing is recommended. Shoe covers are provided and mandatory for entering the Mausoleum.</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 hover:border-primary transition-all flex flex-col items-center text-center shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary mb-4 shadow-sm">
                    <CameraOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-on-surface mb-2">Camera Policy</h3>
                  <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">Still photography is permitted on the grounds, but prohibited inside the main mausoleum chamber.</p>
                </div>
              </div>
            </section>

            {/* Traveler Reviews */}
            {reviewsList.length > 0 && (
              <section className="border-t border-outline-variant/30 pt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-on-surface">Traveler Reviews</h2>
                </div>
                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div key={review.id} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center font-black text-xs text-on-primary-container">
                            {review.user_name ? review.user_name.slice(0, 2).toUpperCase() : "US"}
                          </div>
                          <div>
                            <p className="text-xs font-black text-on-surface">{review.user_name}</p>
                            <p className="text-[10px] text-on-surface-variant font-bold">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' }) : "Verified Guest"}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-tertiary-container">
                          {"★".repeat(review.rating || 5)}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface font-semibold italic leading-relaxed">
                        "{review.review_text}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1 bg-primary/5 rounded-[24px] p-4">
            <div className="sticky top-28 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">

              {/* Urgency Banner */}
              <div className="bg-error-container text-on-error-container px-3 py-2 rounded-lg flex items-center gap-2">
                <Flame className="w-4 h-4 animate-pulse shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider">Selling Fast! 14 tickets left</span>
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-1">
                <h2 className="text-2xl font-black text-primary">₹{totalPrice > 0 ? totalPrice : ticketPrices.indian}</h2>
                <span className="text-xs text-on-surface-variant font-semibold">/{totalTickets > 0 ? `${totalTickets} traveler${totalTickets > 1 ? 's' : ''}` : 'person'}</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl bg-surface-container p-5 border border-outline-variant/30">
                  <p className="text-xs uppercase font-bold tracking-[0.24em] text-on-surface-variant">Ready to book?</p>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                    Select nationality and visit details on the booking page. Date, guests, and payment are completed there.
                  </p>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-primary hover:brightness-110 text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <>
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
