import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { 
  ArrowLeft, Share2, MapPin, Star, Clock, Zap, Award, Gauge, Ticket, 
  CheckCircle2, CreditCard, Shirt, CameraOff, Plus, Minus, ArrowRight, ShieldAlert,
  Calendar, Flame, HelpCircle
} from "lucide-react";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

const MOCK_TAJ_MAHAL = {
  public_id: "taj-mahal",
  id: "taj-mahal",
  name: "Taj Mahal Official Entry Ticket",
  category: "UNESCO World Heritage Site",
  description: "Witness the jewel of Mughal art in India and one of the universally admired masterpieces of the world's heritage. The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in Agra. Commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal, it stands as the ultimate monument of love. Built over 20 years using materials from all over India and Asia, it displays Persian, Islamic, and Indian architectural styles in perfect harmony.",
  image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsUABCQfhFFId33IdV_POy3XDyV9ZCj5cfcX6qK2E0Cdfx9PES_4cQus_8dGf0sS9VAL0zUmAzouDTo6vLZ_gHPhsvnFnH_bmSl7eDLonjEC9b2AwyZKLavA8ZtQpIaQqPx3F62dD7OjWf_WpMbWae-2sXHqY0yKOcON0lw15yjfxZhva_lgEwG04QTWlayjeu4MVt-TijzCpI07TBeMY3qz578Djhj0QNhpGAf_utomKMkhv9ISM4V4zL4YNKO00OfGsapPhQEkg",
  image_detail: "https://lh3.googleusercontent.com/aida-public/AB6AXuB94Xi-6LNCtFtqKRlHt5lmH-2jLooKE6lH_Z4Uj-ZvGSfRK_l197PkRDmPUyN_UqTjadnavJTUBk1F5pqKI6mziy0PO6YVAvRZz1wm68RE0WMxxZj49WB2QL0uQkzmw8ucm1PQAmNKly86w9ORKZiMq3vjo6CcGXt0zWvHu8D0MQv-Vk15wIvm3uPDzkuuQ8TzoTwrMUnqcOQ3UA0mqZ3y8LQEJKXsD9Boa-0XbZ85mk7yEriyMwIQbVgbAwRjZnmra_qu7g14_ko",
  image_gardens: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjRkn60X4gHSvZ-oKjklhjsIu3rTdAuRBsrl7xi86uz-EEuycVNDPMVU9FSXcQ-6KMZ2vO35baz05e8TiU_LCm7K3nRt40nEzp1aqIloU9ymYBbWOisq0pl8EuEwT-U-O9cCKMUWeWGid_x0Ff9gsGCpoyLsENZXVRgCHRc9NNKz-Mf2-osxrzLAQXV64FSSqbUB8eLPAow15n0C6UaLDMpQ4u5g3iExTOLNfADo-hy8lUVoyD0rvfIt2Lrcr1zo1WjuLDXtBRnto",
  image_sunrise: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGMRs2EcEwYa9DEM_p6TQaDXzNBxubvlXhNbWRNXgQmH8NbcEnBfpJW76KSiVquOsCheYd4hUleMia4pFDrJzQUFR4JMk5Ki3VM2ntqsoiiyrMpqBD_AY1VLW7SPcBlq3FPtRAncdj6ANcJZ-KWEhiITO_k3RM-XFGZtrk1vSXUln88zOnGlw01dDon0UKmkSAVK8m3t1oGSdf2VT0VBh1yQf9mI21c5gLjvJwbuDGhd4mlbTBdAY0pmLhZbqfoXlbUsScyfMi5pQ",
  opening_time: "06:00",
  closing_time: "18:30",
  location: "Agra, Uttar Pradesh",
  entry_fee_base: 45,
  foreigner_fee_base: 1050,
  average_rating: 4.9,
  reviews: {
    results: [
      { id: 1, user_name: "Sarah Jenkins", created_at: "2026-06-03T12:00:00Z", rating: 5, review_text: "Booking through this app was seamless. The QR code worked instantly at the West Gate. Sunrise was magical!" }
    ]
  },
  is_open: true
};

export function ExperienceDemo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(MOCK_TAJ_MAHAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Date Generator for next 7 days (used in mobile Picker)
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

  // Booking states
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("06:00 AM - 09:00 AM (Sunrise)");

  useEffect(() => {
    if (dates[selectedDateIndex]) {
      setSelectedDate(dates[selectedDateIndex].iso);
    }
  }, [selectedDateIndex, dates]);
  
  // Separate traveler counts (also supports desktop selected base ticket price switcher)
  const [indianCount, setIndianCount] = useState(1);
  const [foreignerCount, setForeignerCount] = useState(0);
  
  // Nationality toggle for desktop (so you can click to select standard/foreigner)
  const [selectedNationality, setSelectedNationality] = useState("indian");

  // Mobile Bottom sheet Picker and scroll states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const normalizedId = id ? id.toLowerCase() : "";

  useEffect(() => {
    if (!id || normalizedId === "taj-mahal" || normalizedId === "taj_mahal" || window.location.pathname.toLowerCase().includes("taj")) {
      setExperience(MOCK_TAJ_MAHAL);
      setLoading(false);
    } else {
      
    }
  }, [id]);

  const getItem = () => {
    setLoading(true);
    setError("");
    
  };

  // Mobile Sticky Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const pricingSection = document.getElementById("pricing-cards-section");
      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        if (rect.bottom < 64) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalTickets = indianCount + foreignerCount;
  const totalPrice = (indianCount * 45) + (foreignerCount * 1050);

  const handleIndianCountChange = (delta) => {
    setIndianCount((current) => Math.max(0, current + delta));
  };

  const handleForeignerCountChange = (delta) => {
    setForeignerCount((current) => Math.max(0, current + delta));
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (totalTickets === 0) {
      alert("Please select at least 1 traveler before booking.");
      return;
    }

    const bookingData = {
      experience: "taj-mahal",
      booking_date: selectedDate,
      total_tickets: parseInt(totalTickets, 10),
      slot_time: timeSlot.includes("Sunrise") ? "06:00" : "10:00",
    };

    try {
      const response = await api.post("/api/booking/create/", bookingData);
      navigate(`/payment/${response.data.booking_reference}`);
    } catch (error) {
      console.error("Booking creation failed:", error);
      alert(error.response?.data?.message || "Failed to create booking. Please try again.");
    }
  };

  const togglePicker = () => {
    setShowDatePicker(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] font-['Sora'] antialiased pt-0 pb-24 lg:pb-12">
      
      {/* -------------------- MOBILE LAYOUT (attraction.txt) -------------------- */}
      <div className="lg:hidden">
        {/* Hero Section */}
        <section className="relative w-full h-[50vh] sm:h-[60vh] min-h-[350px] overflow-hidden">
          <img 
            alt="Taj Mahal" 
            className="w-full h-full object-cover" 
            src={experience.image_url}
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
                <span className="bg-[#006b55] text-white text-[9px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase shadow-xs">
                  Instant Confirmation
                </span>
                <div className="flex items-center gap-1 bg-[#f9ad12] text-slate-900 px-2 py-0.5 rounded font-black text-[10px]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>4.9 (12.4k)</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold mb-1.5 leading-tight tracking-tight">
                {experience.name}
              </h2>
              <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white" /> {experience.location}
              </p>
            </div>
          </div>
        </section>

        {/* Urgency Scarcity Banner */}
        <div className="bg-[#ffdad6] text-[#93000a] px-4 sm:px-8 py-3 flex items-center gap-3 shadow-xs">
          <Zap className="w-5 h-5 animate-pulse shrink-0" />
          <p className="text-xs sm:text-sm font-bold">
            Selling Fast: <span className="font-extrabold">85% of tickets</span> for tomorrow are already booked.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="px-4 sm:px-8 py-8 space-y-8">
          
          {/* Pricing cards */}
          <section id="pricing-cards-section" className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#e7e8e9] shadow-xs">
              <p className="text-xs font-semibold text-[#3b4a44] mb-1">Indian National</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#006b55]">₹45</span>
                <span className="text-[10px] text-[#636467] font-bold">/ guest</span>
              </div>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-[#e7e8e9] shadow-xs">
              <p className="text-xs font-semibold text-[#3b4a44] mb-1">Foreigner</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#006b55]">₹1,050</span>
                <span className="text-[10px] text-[#636467] font-bold">/ guest</span>
              </div>
            </div>
          </section>

          {/* Value Props Row */}
          <section className="flex justify-between overflow-x-auto hide-scrollbar gap-4 py-2 border-b border-[#e7e8e9] pb-6">
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#006b55]/10 flex items-center justify-center text-[#006b55]">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-[#3b4a44]">Free<br/>Cancellation</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#006b55]/10 flex items-center justify-center text-[#006b55]">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-[#3b4a44]">Authorized<br/>Partner</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#006b55]/10 flex items-center justify-center text-[#006b55]">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-[#3b4a44]">Fast-track<br/>Entry</span>
            </div>
            <div className="flex flex-col items-center min-w-[75px] text-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-[#006b55]/10 flex items-center justify-center text-[#006b55]">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold leading-tight text-[#3b4a44]">Mobile<br/>Tickets</span>
            </div>
          </section>

          {/* What's Included */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#191c1d]">What's Included</h3>
            <ul className="space-y-3 font-semibold text-xs sm:text-sm text-[#3b4a44]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                <span>Skip-the-line entrance to the main complex</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                <span>Access to the Mausoleum (Optional Add-on)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                <span>Access to Mosque and Museum</span>
              </li>
            </ul>
          </section>

          {/* Why Sunrise Editorial */}
          <section className="bg-[#F7F9F9] -mx-4 sm:-mx-8 px-4 sm:px-8 py-8 rounded-3xl">
            <h3 className="text-lg font-black text-[#191c1d] mb-3">Why visit at Sunrise?</h3>
            <p className="text-xs sm:text-sm text-[#3b4a44] leading-relaxed font-semibold mb-6">
              Witnessing the ivory-white marble turn shades of soft pink and gold is a once-in-a-lifetime experience. At sunrise, the crowds are thinnest, the air is crisp, and the reflection in the Yamuna River is most serene.
            </p>
            <div className="h-64 rounded-2xl overflow-hidden shadow-xs relative">
              <img 
                alt="Taj Mahal Sunrise" 
                className="w-full h-full object-cover" 
                src={experience.image_sunrise} 
              />
            </div>
          </section>

          {/* Bento Pro Tips */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#191c1d]">Pro Tips</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[#006b55]/5 rounded-2xl border border-[#006b55]/10">
                <CreditCard className="w-5 h-5 text-[#006b55] mb-2" />
                <p className="text-xs font-black text-[#191c1d] mb-1">Carry ID</p>
                <p className="text-[11px] text-[#3b4a44] font-semibold leading-relaxed">A valid original government ID is mandatory for entry.</p>
              </div>
              <div className="p-5 bg-[#b35b4b]/5 rounded-2xl border border-[#b35b4b]/10">
                <Shirt className="w-5 h-5 text-[#b35b4b] mb-2" />
                <p className="text-xs font-black text-[#191c1d] mb-1">Dress Code</p>
                <p className="text-[11px] text-[#3b4a44] font-semibold leading-relaxed">Shoes must be removed at the mausoleum entrance.</p>
              </div>
              <div className="col-span-2 p-5 bg-[#375ca8]/5 rounded-2xl border border-[#375ca8]/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e7e8e9] rounded-xl flex items-center justify-center shrink-0">
                  <CameraOff className="w-6 h-6 text-[#375ca8]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#191c1d] mb-0.5">Pro Cameras Restricted</p>
                  <p className="text-[11px] text-[#3b4a44] font-semibold leading-relaxed">Tripods and professional lighting require prior written permission.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Traveler Reviews */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-[#191c1d]">Traveler Reviews</h3>
            <div className="p-5 bg-white rounded-2xl border border-[#e7e8e9] shadow-xs">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#e1e3e4] flex items-center justify-center text-[#006b55] font-bold text-xs uppercase">
                    S
                  </div>
                  <span className="text-xs font-bold text-[#191c1d]">Sarah Jenkins</span>
                </div>
                <div className="flex text-[#f9ad12]">
                  {"★".repeat(5)}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#3b4a44] leading-relaxed font-semibold">
                "Booking through this app was seamless. The QR code worked instantly at the West Gate. Sunrise was magical!"
              </p>
            </div>
          </section>

        </div>

        {/* Persistent Bottom Mobile Footer */}
        <footer className="fixed bottom-0 left-0 w-full z-45 bg-white px-6 py-4 border-t border-[#e7e8e9] flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#636467] font-bold uppercase tracking-wider">Starting from</span>
            <span className="text-xl font-extrabold text-[#006b55]">₹45</span>
          </div>
          <button 
            onClick={togglePicker}
            className="bg-[#006b55] hover:brightness-110 text-white px-10 py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Book Now
          </button>
        </footer>

        {/* Mobile Bottom Sheet Date & Guest Picker Modal */}
        <div 
          onClick={togglePicker}
          className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
            showDatePicker ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] p-6 sm:p-8 transition-transform duration-300 shadow-2xl ${
              showDatePicker ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="w-12 h-1.5 bg-[#e5e2e3] rounded-full mx-auto mb-6"></div>
            <h4 className="text-lg font-black text-center mb-6 text-[#191c1d]">Plan your visit</h4>
            
            <div className="space-y-6">
              
              {/* Date selection inside sheet */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3b4a44]">Select Date</p>
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2">
                  {dates.map((date, index) => {
                    const isSelected = dates[selectedDateIndex]?.iso === date.iso;
                    return (
                      <button
                        key={date.iso}
                        onClick={() => setSelectedDateIndex(index)}
                        className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border transition-colors cursor-pointer ${
                          isSelected 
                            ? "border-[#006b55] bg-[#006b55]/5 text-[#006b55] font-bold" 
                            : "border-[#e7e8e9] hover:border-[#006b55]"
                        }`}
                      >
                        <span className="text-[8px] font-black">{date.month}</span>
                        <span className="text-xl font-extrabold my-0.5">{date.day}</span>
                        <span className="text-[8px] opacity-80">{date.isToday ? "Today" : date.weekday}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest adjusters inside sheet */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#3b4a44]">Guests</p>
                
                <div className="p-4 border border-[#e7e8e9] rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-[#191c1d]">Indian National</p>
                    <p className="text-[10px] text-[#636467] font-semibold">Adults (15+ years) • ₹45</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleIndianCountChange(-1)}
                      className="w-8 h-8 rounded-full border border-[#bdc9c3] flex items-center justify-center text-[#636467] hover:bg-slate-50 cursor-pointer active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-[#191c1d] w-3 text-center">{indianCount}</span>
                    <button 
                      onClick={() => handleIndianCountChange(1)}
                      className="w-8 h-8 rounded-full border border-[#006b55] text-[#006b55] flex items-center justify-center hover:bg-[#006b55]/5 cursor-pointer active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-[#e7e8e9] rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-[#191c1d]">Foreigner</p>
                    <p className="text-[10px] text-[#636467] font-semibold">Adults (15+ years) • ₹1,050</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleForeignerCountChange(-1)}
                      className="w-8 h-8 rounded-full border border-[#bdc9c3] flex items-center justify-center text-[#636467] hover:bg-slate-50 cursor-pointer active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-[#191c1d] w-3 text-center">{foreignerCount}</span>
                    <button 
                      onClick={() => handleForeignerCountChange(1)}
                      className="w-8 h-8 rounded-full border border-[#006b55] text-[#006b55] flex items-center justify-center hover:bg-[#006b55]/5 cursor-pointer active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              <button 
                onClick={handleBuyNow}
                className="w-full bg-[#006b55] hover:brightness-110 text-white py-4 rounded-xl font-bold text-sm mt-4 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Payment • ₹{totalPrice}
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- DESKTOP LAYOUT (attr-desc.txt) -------------------- */}
      <div className="hidden lg:block max-w-[1280px] mx-auto px-6 py-8">
        
        {/* Breadcrumb & Title Section */}
        <div className="mb-8">
          <nav className="flex gap-1.5 text-[#3b4a44] font-semibold text-xs mb-2 uppercase tracking-wider">
            <Link className="hover:text-[#006b55] transition-colors" to="/">India</Link>
            <span>/</span>
            <Link className="hover:text-[#006b55] transition-colors" to="/cities">Agra</Link>
            <span>/</span>
            <span className="text-[#191c1d] font-bold">Taj Mahal</span>
          </nav>
          
          <div className="flex justify-between items-end gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#191c1d] mb-1.5">{experience.name}</h1>
              <div className="flex items-center gap-4 text-[#3b4a44] text-sm font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#006b55]" />
                  Agra, Uttar Pradesh
                </span>
                <span className="w-1.5 h-1.5 bg-[#bdc9c3] rounded-full"></span>
                <span className="flex items-center gap-1 text-[#006b55] font-extrabold">
                  <Zap className="w-4 h-4" />
                  Instant Confirmation
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#e1e3e4] px-4 py-2 rounded-full">
              <div className="flex items-center text-[#f9ad12]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-[#191c1d] ml-1">4.9</span>
              </div>
              <span className="text-[#3b4a44] text-xs font-semibold">(12.4k+ Reviews)</span>
            </div>
          </div>
        </div>

        {/* 3-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Left Columns (Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Immersive Gallery */}
            <section className="grid grid-cols-12 grid-rows-2 gap-4 h-[500px]">
              <div className="col-span-8 row-span-2 relative overflow-hidden rounded-2xl group cursor-pointer border border-[#e7e8e9]">
                <img 
                  alt="Taj Mahal Hero" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
                  src={experience.image_url} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="col-span-4 row-span-1 overflow-hidden rounded-2xl group cursor-pointer border border-[#e7e8e9]">
                <img 
                  alt="Taj Mahal Detail" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={experience.image_detail} 
                />
              </div>
              <div className="col-span-4 row-span-1 relative overflow-hidden rounded-2xl group cursor-pointer border border-[#e7e8e9]">
                <img 
                  alt="Taj Mahal Gardens" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={experience.image_gardens} 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-xs font-black border border-white px-4 py-2 rounded-lg">View All Photos</span>
                </div>
              </div>
            </section>

            {/* What's Included */}
            <section className="bg-white p-6 rounded-2xl border border-[#e7e8e9] shadow-xs">
              <h2 className="text-lg font-black text-[#191c1d] mb-6">What's Included</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#191c1d] font-extrabold">Skip-the-line Admission</p>
                    <p className="text-xs text-[#3b4a44] mt-0.5">Priority entry through the dedicated fast-track gate.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#191c1d] font-extrabold">Mausoleum Access</p>
                    <p className="text-xs text-[#3b4a44] mt-0.5">Entrance to the central inner tomb of Mumtaz Mahal & Shah Jahan.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#191c1d] font-extrabold">Mosque & Guest House</p>
                    <p className="text-xs text-[#3b4a44] mt-0.5">Access to the red sandstone peripheral structures.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#006b55] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#191c1d] font-extrabold">Taj Museum Entry</p>
                    <p className="text-xs text-[#3b4a44] mt-0.5">View original architectural drawings and Mughal artifacts.</p>
                  </div>
                </li>
              </ul>
            </section>

            {/* Why Visit at Sunrise */}
            <section className="py-4">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 space-y-4">
                  <h2 className="text-lg font-black text-[#191c1d]">Why Visit at Sunrise?</h2>
                  <p className="text-sm text-[#3b4a44] font-semibold leading-relaxed">
                    Witnessing the Taj Mahal at dawn is a spiritual experience. As the first rays of the sun hit the semi-translucent white marble, the monument transforms from a soft grey-blue to a vibrant, glowing gold. This "Editorial Hour" offers the best photography light and significantly thinner crowds, allowing for a moment of quiet contemplation in the shadow of eternal love.
                  </p>
                  <div className="flex gap-4 pt-2">
                    <div className="bg-[#F7F9F9] p-4 rounded-xl border border-[#e7e8e9] flex-1">
                      <span className="block text-xl font-black text-[#006b55] mb-1">05:30</span>
                      <span className="text-[10px] text-[#3b4a44] font-bold">Recommended Arrival</span>
                    </div>
                    <div className="bg-[#F7F9F9] p-4 rounded-xl border border-[#e7e8e9] flex-1">
                      <span className="block text-xl font-black text-[#006b55] mb-1">85%</span>
                      <span className="text-[10px] text-[#3b4a44] font-bold">Fewer Crowds</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img 
                    alt="Sunrise at Taj" 
                    className="rounded-2xl border border-[#e7e8e9] shadow-sm w-full h-[280px] object-cover" 
                    src={experience.image_sunrise} 
                  />
                </div>
              </div>
            </section>

            {/* Pro Tips Section */}
            <section className="space-y-6">
              <h2 className="text-lg font-black text-[#191c1d]">Pro Tips for Your Visit</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#e7e8e9] hover:border-[#006b55] transition-all">
                  <CreditCard className="w-8 h-8 text-[#00846c] mb-3" />
                  <h3 className="text-sm font-extrabold text-[#191c1d] mb-1.5">Valid ID</h3>
                  <p className="text-xs text-[#3b4a44] font-semibold leading-relaxed">All visitors must carry an original passport or government-issued ID card matching the booking name.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e7e8e9] hover:border-[#006b55] transition-all">
                  <Shirt className="w-8 h-8 text-[#00846c] mb-3" />
                  <h3 className="text-sm font-extrabold text-[#191c1d] mb-1.5">Dress Code</h3>
                  <p className="text-xs text-[#3b4a44] font-semibold leading-relaxed">Modest clothing is recommended. Shoe covers are provided and mandatory for entering the Mausoleum.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e7e8e9] hover:border-[#006b55] transition-all">
                  <CameraOff className="w-8 h-8 text-[#00846c] mb-3" />
                  <h3 className="text-sm font-extrabold text-[#191c1d] mb-1.5">Camera Policy</h3>
                  <p className="text-xs text-[#3b4a44] font-semibold leading-relaxed">Still photography is permitted on the grounds, but prohibited inside the main mausoleum chamber.</p>
                </div>
              </div>
            </section>

            {/* Traveler Reviews */}
            <section className="border-t border-[#e7e8e9] pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#191c1d]">Traveler Reviews</h2>
                <button className="text-[#006b55] font-extrabold text-xs hover:underline">Read All 12k+ Reviews</button>
              </div>
              <div className="p-5 rounded-2xl bg-[#f6f3f4] border border-[#e7e8e9]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8ef6d8] flex items-center justify-center font-black text-xs text-[#002019]">AM</div>
                    <div>
                      <p className="text-xs font-black text-[#191c1d]">Arjun Mehta</p>
                      <p className="text-[10px] text-[#3b4a44] font-bold">October 2025 • Verified Guest</p>
                    </div>
                  </div>
                  <div className="flex text-[#f9ad12]">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#191c1d] font-semibold italic leading-relaxed">
                  "The skip-the-line ticket was a lifesaver. We entered via the West gate at 5:45 AM and were inside before the big rush. Seeing the marble change colors is something I'll never forget."
                </p>
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-[#e7e8e9] rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Urgency Banner */}
              <div className="bg-[#ffdad6] text-[#93000a] px-3 py-2 rounded-lg flex items-center gap-2">
                <Flame className="w-4 h-4 animate-pulse shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider">Selling Fast! 14 tickets left</span>
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-1">
                <h2 className="text-2xl font-black text-[#006b55]">₹{totalPrice > 0 ? totalPrice : 45}</h2>
                <span className="text-xs text-[#3b4a44] font-semibold">/{totalTickets > 0 ? `${totalTickets} traveler${totalTickets > 1 ? 's' : ''}` : 'person'}</span>
              </div>

              {/* Nationality rows with inline counters */}
              <div className="space-y-2 border border-[#e7e8e9] rounded-xl overflow-hidden">
                {/* Indian National */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7e8e9]">
                  <div>
                    <p className="text-xs font-black text-[#191c1d]">Indian National</p>
                    <p className="text-[10px] text-[#006b55] font-bold">₹45 / person</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleIndianCountChange(-1)}
                      className="w-7 h-7 rounded-full border border-[#bdc9c3] flex items-center justify-center font-bold text-[#3b4a44] hover:bg-slate-50 cursor-pointer active:scale-90 text-sm"
                    >−</button>
                    <span className="font-black text-sm w-4 text-center text-[#191c1d]">{indianCount}</span>
                    <button
                      onClick={() => handleIndianCountChange(1)}
                      className="w-7 h-7 rounded-full border border-[#006b55] text-[#006b55] flex items-center justify-center font-bold hover:bg-[#006b55]/5 cursor-pointer active:scale-90 text-sm"
                    >+</button>
                  </div>
                </div>
                {/* Foreigner */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-black text-[#191c1d]">Foreigner</p>
                    <p className="text-[10px] text-[#006b55] font-bold">₹1,050 / person</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleForeignerCountChange(-1)}
                      className="w-7 h-7 rounded-full border border-[#bdc9c3] flex items-center justify-center font-bold text-[#3b4a44] hover:bg-slate-50 cursor-pointer active:scale-90 text-sm"
                    >−</button>
                    <span className="font-black text-sm w-4 text-center text-[#191c1d]">{foreignerCount}</span>
                    <button
                      onClick={() => handleForeignerCountChange(1)}
                      className="w-7 h-7 rounded-full border border-[#006b55] text-[#006b55] flex items-center justify-center font-bold hover:bg-[#006b55]/5 cursor-pointer active:scale-90 text-sm"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#3b4a44] uppercase tracking-wider mb-1">Date</label>
                  <input 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 px-3 border border-[#e7e8e9] rounded-xl focus:ring-2 focus:ring-[#006b55] focus:border-[#006b55] focus:outline-none transition-all text-xs font-semibold bg-white" 
                    type="date"
                  />
                </div>
                <div>
                  <label htmlFor="experience-demo-time-slot" className="block text-[10px] font-bold text-[#3b4a44] uppercase tracking-wider mb-1">Time Slot</label>
                  <select 
                    id="experience-demo-time-slot"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full h-10 px-3 border border-[#e7e8e9] rounded-xl focus:ring-2 focus:ring-[#006b55] focus:border-[#006b55] focus:outline-none transition-all text-xs font-semibold bg-white appearance-none"
                  >
                    <option>06:00 AM - 09:00 AM (Sunrise)</option>
                    <option>09:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 06:00 PM (Sunset)</option>
                  </select>
                </div>
              </div>

              {/* Book Now CTA */}
              <button 
                onClick={handleBuyNow}
                disabled={!experience.is_open}
                className="w-full py-3.5 bg-[#006b55] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
