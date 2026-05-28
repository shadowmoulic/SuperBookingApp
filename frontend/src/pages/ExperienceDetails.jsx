import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

export function ExperienceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Booking details states
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);

  // Review states
  const [reviewFilter, setReviewFilter] = useState("most_recent");
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);

  useEffect(() => {
    getItem();
  }, [id]);

  const getItem = () => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${id}`)
      .then((res) => {
        setExperience(res.data);
      })
      .catch(() => {
        setError("Unable to load experience details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const images = useMemo(() => {
    if (!experience?.image_url) return [];
    const parsedImages = String(experience.image_url)
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
    return parsedImages;
  }, [experience]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id, images.length]);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hourString, minuteString] = String(timeString).split(":");
    const hour = Number(hourString);
    const minute = Number(minuteString || 0);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "N/A";
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  const reviewItems = useMemo(() => {
    if (!experience?.reviews) return [];
    return (
      experience.reviews.results ||
      (Array.isArray(experience.reviews) ? experience.reviews : [])
    );
  }, [experience]);

  // Date Generator for next 7 days
  const dates = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: date.toLocaleDateString("en-US", { day: "numeric" }),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        iso: date.toISOString().slice(0, 10),
      };
    });
  }, []);

  // Category Configuration
  const categorySlug = experience?.category?.toLowerCase() || "tour";

  const tourOptions = useMemo(() => [
    {
      id: "slot-1",
      title: "Slot A",
      time: "10:00",
      details: "Guided entry and audio support.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
    {
      id: "slot-2",
      title: "Slot B",
      time: "12:00",
      details: "Small group tour with museum highlights.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
    {
      id: "slot-3",
      title: "Slot C",
      time: "14:00",
      details: "Exclusive late afternoon entry.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
    {
      id: "slot-4",
      title: "Slot D",
      time: "16:00",
      details: "Family-friendly tour with priority seating.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
  ], [experience]);

  const concertOptions = useMemo(() => [
    {
      id: "seat-vip",
      title: "VIP Box",
      details: "Front row, best sound experience.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) + 45 : 65,
    },
    {
      id: "seat-floor",
      title: "Floor Seating",
      details: "Close to stage, limited availability.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) + 25 : 45,
    },
    {
      id: "seat-balcony",
      title: "Balcony Access",
      details: "Elevated view, comfortable seating.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) + 10 : 30,
    },
    {
      id: "seat-general",
      title: "General Admission",
      details: "Great value with open seating.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
  ], [experience]);

  const museumOptions = useMemo(() => [
    {
      id: "access-general",
      title: "General Entry",
      details: "Access to main galleries and regular exhibitions.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) : 20,
    },
    {
      id: "access-premium",
      title: "Premium Access",
      details: "Includes priority entry and special exhibits.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) + 18 : 38,
    },
    {
      id: "access-guided",
      title: "Guided Tour",
      details: "Curator-led tour with expert commentary.",
      price: experience?.entry_fee_base ? Number(experience.entry_fee_base) + 32 : 52,
    },
  ], [experience]);

  const activeOptions = useMemo(() => {
    if (categorySlug.includes("concert")) return concertOptions;
    if (categorySlug.includes("museum")) return museumOptions;
    return tourOptions;
  }, [categorySlug, concertOptions, museumOptions, tourOptions]);

  // Set default option
  useEffect(() => {
    if (activeOptions.length > 0) {
      setSelectedOption(activeOptions[0]);
    }
  }, [activeOptions]);

  const selectedPrice = selectedOption?.price ?? (experience?.entry_fee_base ? Number(experience.entry_fee_base) : 0);
  const totalPrice = selectedPrice * ticketCount;

  const handleTicketCountChange = (delta) => {
    setTicketCount((current) => Math.max(1, current + delta));
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!selectedOption || !experience) {
      alert("Please select an option before booking");
      return;
    }

    const slotTime = selectedOption.time || null;

    const bookingData = {
      experience: experience.public_id,
      booking_date: dates[selectedDateIndex].iso,
      total_tickets: parseInt(ticketCount, 10),
      slot_time: slotTime,
    };

    try {
      const response = await api.post("/api/booking/create/", bookingData);
      console.log("Booking created successfully:", response.data);
      navigate(`/payment/${response.data.booking_reference}`);
    } catch (error) {
      console.error("Booking creation failed:", error);
      alert(
        error.response?.data?.message ||
        "Failed to create booking. Please try again.",
      );
    }
  };

  // Review calculations
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewItems.forEach((r) => {
      const rating = Math.round(r.rating);
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });
    return counts;
  }, [reviewItems]);

  const ratingPercentages = useMemo(() => {
    const total = reviewItems.length || 1;
    const percentages = {};
    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round((ratingCounts[i] / total) * 100);
    }
    return percentages;
  }, [ratingCounts, reviewItems.length]);

  const processedReviews = useMemo(() => {
    let items = [...reviewItems];

    // Filter reviews
    if (reviewFilter === "best") {
      items = items.filter((r) => r.rating >= 4);
    } else if (reviewFilter === "worst") {
      items = items.filter((r) => r.rating <= 2);
    } else if (reviewFilter === "average") {
      items = items.filter((r) => r.rating === 3);
    }

    // Sort reviews
    if (reviewFilter === "most_recent" || reviewFilter === "best" || reviewFilter === "worst" || reviewFilter === "average") {
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (reviewFilter === "oldest") {
      items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    if (reviewFilter === "best") {
      items.sort((a, b) => b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at));
    } else if (reviewFilter === "worst") {
      items.sort((a, b) => a.rating - b.rating || new Date(b.created_at) - new Date(a.created_at));
    }

    return items;
  }, [reviewItems, reviewFilter]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8 relative animate-pulse">
        {/* Hero Cover Skeleton */}
        <div className="h-[400px] rounded-xl bg-gray-200 skeleton mb-8" />

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl border border-gray-150 p-6 md:p-8 shadow-xs space-y-4">
              <div className="h-6 w-48 bg-gray-200 skeleton rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 skeleton rounded" />
                <div className="h-4 w-full bg-gray-200 skeleton rounded" />
                <div className="h-4 w-2/3 bg-gray-200 skeleton rounded" />
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 skeleton rounded" />
                  <div className="h-5 w-32 bg-gray-200 skeleton rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 skeleton rounded" />
                  <div className="h-5 w-32 bg-gray-200 skeleton rounded" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-150 p-6 md:p-8 shadow-xs space-y-4">
              <div className="h-6 w-36 bg-gray-200 skeleton rounded" />
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 skeleton rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-xs space-y-6">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 skeleton rounded" />
                <div className="h-8 w-24 bg-gray-200 skeleton rounded" />
              </div>
              <div className="h-12 bg-gray-200 skeleton rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-gray-500 font-['Inter']">
        {error || "Experience details not available."}
      </div>
    );
  }

  const activeImage = images[selectedImageIndex] || experience.image_url || "";

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8 relative">

      {/* Hero Cover Section */}
      <div className="h-[400px] rounded-xl relative overflow-hidden group shadow-lg mb-8">
        <img
          src={activeImage}
          alt={experience.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          {/* Label Badge */}
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 w-fit uppercase font-['Hanken_Grotesk'] tracking-wider shadow-sm">
            {experience.category || "Heritage Site"}
          </span>
          {/* Title */}
          <h1 className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#fff] leading-tight drop-shadow-md tracking-tight">
            {experience.name}
          </h1>
        </div>

        {/* Gallery indicators inside hero */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-8 flex gap-2 z-10 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedImageIndex === idx ? "bg-[#fff] scale-110" : "bg-[#fff]/40"
                  }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column - Form & Selection */}
        <div className="lg:col-span-8 space-y-8">

          {/* Experience Details Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900 mb-4">About the Experience</h2>
            <p className="font-['Inter'] text-gray-600 leading-relaxed mb-6">
              {experience.description || "No additional description available."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase font-['Inter'] tracking-wider block mb-1">Timings</span>
                <span className="font-['Hanken_Grotesk'] text-base font-semibold text-gray-800">
                  {`${formatTime(experience.opening_time)} - ${formatTime(experience.closing_time)}`}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase font-['Inter'] tracking-wider block mb-1">Location</span>
                <span className="font-['Hanken_Grotesk'] text-base font-semibold text-gray-800">
                  {experience.location}, India
                </span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase font-['Inter'] tracking-wider block mb-2">Rules & Guidelines</span>
              <p className="font-['Inter'] text-sm text-gray-500 leading-relaxed">
                {experience.is_open
                  ? "Please arrive 15 minutes early, carry a valid photo ID, and present your digital QR code at the ticket gate."
                  : "This site is currently closed and not accepting bookings."}
              </p>
            </div>
          </div>

          {/* Date Selection Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900 mb-1">Select Visit Date</h2>
              <p className="font-['Inter'] text-sm text-gray-500">Pick a day for your reservation</p>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {dates.map((date, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <button
                    key={date.iso}
                    type="button"
                    onClick={() => setSelectedDateIndex(index)}
                    className={`flex flex-col items-center justify-center py-3 rounded-lg border transition-all duration-300 cursor-pointer ${isSelected
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "bg-white border-gray-100 text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {date.weekday}
                    </span>
                    <span className="font-['Hanken_Grotesk'] text-xl font-bold my-0.5">
                      {date.day}
                    </span>
                    <span className={`text-[9px] ${isSelected ? "text-white/85" : "text-gray-500"}`}>
                      {date.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Access Levels Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900 mb-1">
                {categorySlug.includes("concert")
                  ? "Seat Selection"
                  : categorySlug.includes("museum")
                    ? "Access Levels"
                    : "Available Slots"}
              </h2>
              <p className="font-['Inter'] text-sm text-gray-500">Select the ticket type that suits you best</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeOptions.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option)}
                    className={`flex flex-col p-6 rounded-xl border text-left transition-all duration-300 h-full justify-between cursor-pointer ${isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                      }`}
                  >
                    <div>
                      <h3 className="font-['Hanken_Grotesk'] font-bold text-lg text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      {option.time && (
                        <span className="inline-block bg-primaryContainer/30 text-on-primaryContainer text-xs font-semibold px-2 py-0.5 rounded-md mb-3">
                          Time: {option.time} hrs
                        </span>
                      )}
                      <p className="font-['Inter'] text-sm text-gray-500 leading-relaxed mb-6">
                        {option.details}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-50 w-full">
                      <span className="text-[10px] text-gray-400 block font-['Inter'] uppercase tracking-wider mb-0.5">Price per ticket</span>
                      <span className="font-['JetBrains_Mono'] text-xl font-bold text-primary">
                        ₹{Number(option.price).toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating and Reviews Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900 mb-6">Visitor Ratings & Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

              {/* Left Side: Rating Summary */}
              <div className="md:col-span-5 flex flex-col items-center md:items-start md:pr-6 md:border-r md:border-gray-100">
                <span className="font-['Hanken_Grotesk'] text-6xl font-extrabold text-gray-900 leading-none">
                  {experience.average_rating ? Number(experience.average_rating).toFixed(1) : "0.0"}
                </span>
                <div className="flex gap-0.5 text-yellow-400 text-xl my-3">
                  {"★".repeat(Math.round(experience.average_rating || 0))}
                  {"☆".repeat(5 - Math.round(experience.average_rating || 0))}
                </div>
                <span className="font-['Inter'] text-sm text-gray-500 mb-6">
                  Based on {reviewItems.length} reviews
                </span>

                {/* Progress bars */}
                <div className="w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3 text-xs text-gray-500 font-['Inter']">
                      <span className="w-3 text-right">{stars}</span>
                      <span className="text-yellow-400">★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${ratingPercentages[stars] || 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{ratingPercentages[stars] || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: User Reviews list */}
              <div className="md:col-span-7 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-base">Reviews ({processedReviews.length})</h3>
                  <select
                    value={reviewFilter}
                    onChange={(e) => {
                      setReviewFilter(e.target.value);
                      setVisibleReviewsCount(5);
                    }}
                    className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-['Inter']"
                  >
                    <option value="most_recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="best">Best Reviews</option>
                    <option value="average">Average Reviews</option>
                    <option value="worst">Worst Reviews</option>
                  </select>
                </div>
                <div className="space-y-6 flex-1">
                  {processedReviews.slice(0, visibleReviewsCount).map((review) => (
                    <article key={review.id} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h4 className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-sm">{review.user_name}</h4>
                          <span className="text-[11px] text-gray-400 font-['Inter']">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-yellow-400 text-xs flex gap-0.5">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="font-['Inter'] text-sm text-gray-600 leading-relaxed">
                        {review.review_text}
                      </p>
                    </article>
                  ))}
                  {processedReviews.length === 0 && (
                    <p className="text-gray-400 text-sm font-['Inter'] text-center py-8">
                      No reviews match this filter.
                    </p>
                  )}
                </div>
                {processedReviews.length > visibleReviewsCount && (
                  <div className="mt-6 pt-4 text-center border-t border-gray-100">
                    <button
                      onClick={() => setVisibleReviewsCount((prev) => prev + 5)}
                      className="text-primary font-['Hanken_Grotesk'] font-semibold text-sm hover:underline active:scale-95 transition-all cursor-pointer"
                    >
                      View More Reviews
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column - Sidebar Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* Booking Summary Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-md">
              <h3 className="font-['Hanken_Grotesk'] text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Booking Summary
              </h3>
              <div className="space-y-4 font-['Inter'] text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Selected Tier</span>
                  <span className="font-semibold text-gray-800">{selectedOption?.title || "None"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Visit Date</span>
                  <span className="font-semibold text-gray-800">{dates[selectedDateIndex]?.label}</span>
                </div>
                {selectedOption?.time && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Entry Slot</span>
                    <span className="font-semibold text-gray-800">{selectedOption.time} hrs</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price per ticket</span>
                  <span className="font-semibold text-gray-800">₹{Number(selectedPrice).toFixed(2)}</span>
                </div>

                {/* Quantity adjusters */}
                <div className="flex justify-between items-center border-t border-b border-gray-100 py-4 my-6">
                  <div>
                    <span className="font-['Hanken_Grotesk'] font-bold text-gray-900 block">Tickets</span>
                    <span className="text-xs text-gray-400 block font-['Inter']">Adjust quantity</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleTicketCountChange(-1)}
                      className="w-7 h-7 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition-all active:scale-90 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-['JetBrains_Mono'] font-bold text-sm w-5 text-center">{ticketCount}</span>
                    <button
                      type="button"
                      onClick={() => handleTicketCountChange(1)}
                      className="w-7 h-7 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition-all active:scale-90 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal calculation */}
                <div className="flex justify-between items-center text-xs text-gray-450">
                  <span>Subtotal Breakdown</span>
                  <span>₹{Number(selectedPrice).toFixed(2)} × {ticketCount}</span>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-base">Final Total</span>
                  <span className="font-['JetBrains_Mono'] font-bold text-2xl text-primary leading-none">
                    ₹{Number(totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Buy Now button */}
              <button
                onClick={handleBuyNow}
                disabled={!experience.is_open}
                className="w-full mt-6 py-3.5 bg-primary text-white font-['Hanken_Grotesk'] font-semibold rounded-lg hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Buy Now
                <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
              </button>
            </div>

            {/* Digital Ticket Preview */}
            <div className="bg-gradient-to-br from-primaryContainer/10 to-primary/5 rounded-xl border-2 border-dashed border-primary/20 p-6 relative overflow-hidden shadow-xs">
              <div className="text-center mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-['Inter']">Digital Pass Preview</span>
                <h4 className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-sm mt-0.5 truncate">{experience.name}</h4>
              </div>

              <div className="border-t border-b border-dashed border-primary/20 py-3 my-3 space-y-2 text-xs font-['Inter'] text-gray-500">
                <div className="flex justify-between">
                  <span>Ticket Tier</span>
                  <span className="font-semibold text-gray-700">{selectedOption?.title || "General"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-semibold text-gray-700">{ticketCount} {ticketCount > 1 ? "tickets" : "ticket"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visit Date</span>
                  <span className="font-semibold text-gray-700">{dates[selectedDateIndex]?.label}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg border border-gray-150 shadow-sm w-28 h-28 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900 fill-current">
                    <rect x="0" y="0" width="25" height="25" />
                    <rect x="5" y="5" width="15" height="15" fill="white" />
                    <rect x="8" y="8" width="9" height="9" />

                    <rect x="75" y="0" width="25" height="25" />
                    <rect x="80" y="5" width="15" height="15" fill="white" />
                    <rect x="83" y="8" width="9" height="9" />

                    <rect x="0" y="75" width="25" height="25" />
                    <rect x="5" y="80" width="15" height="15" fill="white" />
                    <rect x="8" y="83" width="9" height="9" />

                    <rect x="35" y="10" width="10" height="15" />
                    <rect x="55" y="5" width="10" height="10" />
                    <rect x="40" y="30" width="15" height="15" />
                    <rect x="10" y="35" width="15" height="10" />
                    <rect x="65" y="45" width="10" height="15" />
                    <rect x="30" y="60" width="15" height="10" />
                    <rect x="50" y="75" width="15" height="15" />
                    <rect x="75" y="65" width="10" height="10" />
                    <rect x="85" y="80" width="10" height="15" />
                  </svg>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest uppercase">SCAN AT GATEWAY</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
