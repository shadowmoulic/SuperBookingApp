import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  ChevronDown,
  CreditCard,
  XCircle,
  AlertCircle,
  Zap,
  RotateCcw,
  Calendar,
} from "lucide-react";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Ticket Type
  const [selectedTicketType, setSelectedTicketType] = useState(null);

  // Selected Time Slot (TicketTypeSchedule instance)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Selected Nationality
  const [selectedNationality, setSelectedNationality] = useState("");

  // Guest counts per age category
  const [guestCounts, setGuestCounts] = useState({
    Adult: 1,
    Child: 0,
    Senior: 0,
    Student: 0,
    Infant: 0,
  });

  // Fetch experience data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/experience/${id}`);
        setExperience(res.data);
      } catch {
        setError("Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // All active ticket types for this experience
  const ticketTypes = useMemo(() => {
    return (experience?.ticket_types || []).filter(
      (tt) => tt.is_active !== false
    );
  }, [experience]);

  // Auto-select default ticket type when experience loads
  useEffect(() => {
    if (ticketTypes.length && !selectedTicketType) {
      setSelectedTicketType(ticketTypes[0]);
    }
  }, [ticketTypes, selectedTicketType]);

  // Dates for next 7 days
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
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "long" }),
        iso: date.toISOString().slice(0, 10),
      };
    });
  }, []);

  // Available time slots for the selected ticket type on the selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedTicketType?.schedules?.length) return [];
    const selectedDateIso = dates[selectedDateIndex]?.iso;
    if (!selectedDateIso) return selectedTicketType.schedules.filter((s) => s.is_active !== false);

    const [year, month, day] = selectedDateIso.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekIndex = (dateObj.getDay() + 6) % 7; // 0 = Mon, 1 = Tue, ..., 6 = Sun
    const dayKeys = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const currentDayKey = dayKeys[dayOfWeekIndex];

    const activeSchedules = selectedTicketType.schedules.filter(
      (s) => s.is_active !== false
    );

    const filtered = activeSchedules.filter((slot) => {
      if (slot.recurrence_type === "specific-date" && slot.specific_date) {
        return slot.specific_date === selectedDateIso;
      }
      if (slot.recurrence_type === "weekly" && slot[currentDayKey] !== undefined) {
        return slot[currentDayKey] === true;
      }
      return true;
    });

    return filtered.length ? filtered : activeSchedules;
  }, [selectedTicketType, dates, selectedDateIndex]);

  // Auto-select or update time slot selection when available slots change
  useEffect(() => {
    if (availableTimeSlots.length === 1) {
      setSelectedTimeSlot(availableTimeSlots[0]);
    } else if (availableTimeSlots.length > 1) {
      if (
        !selectedTimeSlot ||
        !availableTimeSlots.some((s) => s.public_id === selectedTimeSlot.public_id)
      ) {
        setSelectedTimeSlot(availableTimeSlots[0]);
      }
    } else {
      setSelectedTimeSlot(null);
    }
  }, [availableTimeSlots]);

  // Available nationality choices strictly from backend pricing rules for the selected ticket type
  const nationalityOptions = useMemo(() => {
    if (!selectedTicketType?.pricing_rules?.length) {
      return [];
    }
    const categoriesFromRules = selectedTicketType.pricing_rules
      .map((r) => r.nationality_category)
      .filter(Boolean);
    return Array.from(new Set(categoriesFromRules));
  }, [selectedTicketType]);

  // Auto-select nationality from available options matching search query or first available option
  useEffect(() => {
    if (!nationalityOptions.length) {
      setSelectedNationality("");
      return;
    }

    const queryNat = searchParams.get("nationality")?.toLowerCase();
    let matched = null;

    if (queryNat) {
      matched = nationalityOptions.find((opt) => {
        const lowerOpt = opt.toLowerCase();
        if (
          queryNat === "foreigner" ||
          queryNat === "others" ||
          queryNat === "international"
        ) {
          return (
            lowerOpt === "others" ||
            lowerOpt.includes("foreign") ||
            lowerOpt.includes("intl")
          );
        }
        return lowerOpt === queryNat || lowerOpt.includes(queryNat);
      });
    }

    if (matched) {
      setSelectedNationality(matched);
    } else if (
      !selectedNationality ||
      !nationalityOptions.includes(selectedNationality)
    ) {
      setSelectedNationality(nationalityOptions[0]);
    }
  }, [nationalityOptions, searchParams]);

  // Available age categories strictly for selected Ticket Type & Nationality from backend pricing rules
  const ageCategories = useMemo(() => {
    if (!selectedTicketType?.pricing_rules?.length) {
      return ["Adult"];
    }
    const matchingRules = selectedTicketType.pricing_rules.filter(
      (r) =>
        r.is_active !== false &&
        (!selectedNationality ||
          r.nationality_category === selectedNationality ||
          r.nationality_category === "Any")
    );
    const cats = Array.from(
      new Set(matchingRules.map((r) => r.age_category).filter(Boolean))
    );
    return cats.length ? cats : ["Adult"];
  }, [selectedTicketType, selectedNationality]);

  // Helper to find price for a given nationality & age category strictly from rules
  const getCategoryPrice = (nationality, ageCategory) => {
    if (!selectedTicketType?.pricing_rules?.length) {
      return Number(experience?.entry_fee_base || 0);
    }
    const rules = selectedTicketType.pricing_rules;
    const matched = rules.find(
      (r) =>
        (r.nationality_category?.toLowerCase() === nationality?.toLowerCase() ||
          r.nationality_category === "Any") &&
        (r.age_category?.toLowerCase() === ageCategory?.toLowerCase() ||
          r.age_category === "Any") &&
        r.is_active !== false
    );
    return Number(matched?.final_price ?? matched?.price ?? experience?.entry_fee_base ?? 0);
  };

  // Starting price for displaying on Ticket Type card
  const getStartingPrice = (ticketType) => {
    if (!ticketType.pricing_rules?.length) {
      return Number(experience?.entry_fee_base || 0);
    }
    const prices = ticketType.pricing_rules
      .filter((r) => r.is_active !== false)
      .map((r) => Number(r.final_price ?? r.price ?? 0));
    return prices.length ? Math.min(...prices) : Number(experience?.entry_fee_base || 0);
  };

  // Guest breakdown calculation based strictly on available age categories
  const guestBreakdown = useMemo(() => {
    return ageCategories.map((cat) => {
      const price = getCategoryPrice(selectedNationality, cat);
      const count = guestCounts[cat] ?? (cat === "Adult" ? 1 : 0);
      return {
        category: cat,
        count,
        price,
        subtotal: count * price,
      };
    });
  }, [ageCategories, selectedNationality, guestCounts, selectedTicketType]);

  const totalTickets = useMemo(() => {
    return guestBreakdown.reduce((sum, item) => sum + item.count, 0);
  }, [guestBreakdown]);

  const totalPrice = useMemo(() => {
    return guestBreakdown.reduce((sum, item) => sum + item.subtotal, 0);
  }, [guestBreakdown]);

  const handleGuestCountChange = (cat, delta) => {
    setGuestCounts((prev) => {
      const current = prev[cat] ?? (cat === "Adult" ? 1 : 0);
      const updated = Math.max(0, current + delta);
      if (cat === "Adult" && updated < 1) return prev;
      return { ...prev, [cat]: updated };
    });
  };

  // Build items payload for booking creation
  const buildBookingItems = () => {
    if (!selectedTicketType) return [];

    const activeItems = guestBreakdown.filter((item) => item.count > 0);
    const nationality = selectedNationality || "Any";

    if (activeItems.length > 0) {
      return activeItems.map((item) => {
        const payload = {
          ticket_type: selectedTicketType.public_id,
          quantity: item.count,
          nationality_category: nationality,
          age_category: item.category || "Any",
        };
        if (selectedTimeSlot?.public_id) {
          payload.time_slot = selectedTimeSlot.public_id;
        }
        return payload;
      });
    }

    const fallbackPayload = {
      ticket_type: selectedTicketType.public_id,
      quantity: Math.max(1, totalTickets),
      nationality_category: nationality,
      age_category: "Any",
    };
    if (selectedTimeSlot?.public_id) {
      fallbackPayload.time_slot = selectedTimeSlot.public_id;
    }
    return [fallbackPayload];
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (totalTickets === 0) {
      alert("Please select at least 1 guest before booking.");
      return;
    }
    if (availableTimeSlots.length > 1 && !selectedTimeSlot) {
      alert("Please select a time slot for your booking.");
      return;
    }

    const selectedDate = dates[selectedDateIndex]?.iso;
    const items = buildBookingItems();
    const bookingData = {
      experience: experience.public_id,
      booking_date: selectedDate,
      total_tickets: parseInt(totalTickets, 10),
      items: items,
    };
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/booking/create/", bookingData);
      navigate(`/payment/${response.data.booking_reference}`);
    } catch (err) {
      console.error("Booking creation failed:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null) ||
        "Failed to create booking. Please try again.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-surface">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm hover:border-primary/50 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.45fr]">
          {/* ─── Main Content ─── */}
          <section className="rounded-[28px] border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="flex flex-col gap-1 border-b border-outline-variant/50 pb-6">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {experience?.name || "Experience Booking"}
              </h1>
              {experience?.city && (
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {experience.city}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-8">
              {/* 1 ▸ Date Selection */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Select Date</h2>
                  <span className="text-sm font-medium text-on-surface-variant">
                    {dates[selectedDateIndex]?.month}
                  </span>
                </div>
                <div className="grid gap-3 grid-cols-4 sm:grid-cols-7">
                  {dates.map((date, index) => {
                    const isSelected = selectedDateIndex === index;
                    return (
                      <button
                        key={date.iso}
                        onClick={() => setSelectedDateIndex(index)}
                        className={`rounded-2xl border px-3 py-3 text-left transition-all cursor-pointer ${isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-outline-variant/50 bg-surface-container-low hover:border-primary/50"
                          }`}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                          {date.weekday}
                        </div>
                        <div className="mt-1 text-xl font-black">
                          {date.label.split(" ")[1]}
                        </div>
                        <div className="text-xs font-medium">
                          {date.label.split(" ")[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2 ▸ Choose Ticket Type */}
              <div>
                <div className="space-y-2.5 border-b border-outline-variant/30 pb-5">
                  <div className="mb-3">
                    <h2 className="text-lg font-bold">Choose Ticket Type</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ticketTypes.length ? (
                      ticketTypes.map((ticket) => {
                        const isSelected =
                          selectedTicketType?.public_id === ticket.public_id;
                        const startingPrice = getStartingPrice(ticket);
                        return (
                          <button
                            key={ticket.public_id}
                            onClick={() => setSelectedTicketType(ticket)}
                            className={`flex flex-col justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer ${isSelected
                              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                              : "border-outline-variant/50 bg-surface-container-low hover:border-primary/50"
                              }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-on-surface">
                                  {ticket.name}
                                </span>
                                {isSelected && (
                                  <CheckCircle2
                                    size={18}
                                    className="text-primary shrink-0"
                                  />
                                )}
                              </div>
                              <p className="mt-1.5 text-xs text-on-surface-variant line-clamp-2">
                                {ticket.description ||
                                  "Entry access for this experience"}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                              <span className="text-xs text-on-surface-variant font-medium">
                                From
                              </span>
                              <span className="text-lg font-black text-primary">
                                ₹{startingPrice}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface-variant">
                        General Entry Access — ₹
                        {Number(experience?.entry_fee_base || 0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Time Slot (Moved above Booking Policy) */}
                {availableTimeSlots.length > 0 && (
                  <div className="space-y-2.5 border-b border-outline-variant/30 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="mb-3">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Clock size={18} className="text-primary" /> Select Time Slot
                        </h2>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {availableTimeSlots.length} slot{availableTimeSlots.length > 1 ? "s" : ""} available
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                      {availableTimeSlots.map((slot) => {
                        const isSelected = selectedTimeSlot?.public_id === slot.public_id;
                        const startTime = slot.schedule_start_time
                          ? slot.schedule_start_time.slice(0, 5)
                          : "";
                        const endTime = slot.schedule_end_time
                          ? slot.schedule_end_time.slice(0, 5)
                          : "";
                        const timeLabel =
                          startTime && endTime
                            ? `${startTime} – ${endTime}`
                            : "Flexible Time Slot";

                        return (
                          <button
                            key={slot.public_id || slot.id}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${isSelected
                              ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-2 ring-primary/20"
                              : "border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50 text-on-surface"
                              }`}
                          >
                            <div className="text-xs font-semibold">{timeLabel}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details panel for the selected ticket type */}
                {selectedTicketType && (
                  <div className="mt-5 rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-5 space-y-5">
                    <div className="flex items-center gap-2 font-bold text-sm text-on-surface">
                      {selectedTicketType.name} — Features & Policy
                    </div>


                    {/* Ticket Features (Grouped by Inclusions, Exclusions, Requirements) */}
                    {selectedTicketType.ticket_features?.length > 0 && (() => {
                      const inclusions = selectedTicketType.ticket_features.filter(
                        (f) => !f.feature_type || f.feature_type.toLowerCase() === "inclusion"
                      );
                      const exclusions = selectedTicketType.ticket_features.filter(
                        (f) => f.feature_type?.toLowerCase() === "exclusion"
                      );
                      const requirements = selectedTicketType.ticket_features.filter(
                        (f) => f.feature_type?.toLowerCase() === "requirement"
                      );

                      return (
                        <div className="space-y-4">
                          {/* Inclusions */}
                          <div className="flex justify-start">

                            {inclusions.length > 0 && (
                              <div className="space-y-2 flex-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                  {/* <CheckCircle2 size={14} className="text-emerald-500" />{" "} */}
                                  Inclusions
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {inclusions.map((feat, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl flex items-start gap-2 text-xs"
                                    >
                                      <CheckCircle2
                                        size={14}
                                        className="text-emerald-500 shrink-0 mt-0.5"
                                      />
                                      <div>
                                        <span className="font-semibold text-on-surface block">
                                          {feat.title}
                                        </span>
                                        {feat.description && (
                                          <span className="text-on-surface-variant text-[11px]">
                                            {feat.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Exclusions */}
                            {exclusions.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                  {/* <XCircle size={14} className="text-rose-500" />{" "} */}
                                  Exclusions
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {exclusions.map((feat, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl flex items-start gap-2 text-xs"
                                    >
                                      <XCircle
                                        size={14}
                                        className="text-rose-500 shrink-0 mt-0.5"
                                      />
                                      <div>
                                        <span className="font-semibold text-on-surface block">
                                          {feat.title}
                                        </span>
                                        {feat.description && (
                                          <span className="text-on-surface-variant text-[11px]">
                                            {feat.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Requirements */}
                          {requirements.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                {/* <AlertCircle size={14} className="text-amber-500" />{" "} */}
                                Requirements
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {requirements.map((feat, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-xl flex items-start gap-2 text-xs"
                                  >
                                    <AlertCircle
                                      size={14}
                                      className="text-amber-500 shrink-0 mt-0.5"
                                    />
                                    <div>
                                      <span className="font-semibold text-on-surface block">
                                        {feat.title}
                                      </span>
                                      {feat.description && (
                                        <span className="text-on-surface-variant text-[11px]">
                                          {feat.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Booking Policy */}
                    {selectedTicketType.booking_policy && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                          <ShieldAlert size={14} className="text-primary" />{" "}
                          Booking Policy
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                          {[
                            [
                              "Confirmation",
                              selectedTicketType.booking_policy
                                .instant_confirmation
                                ? "Instant"
                                : "Manual",
                              Zap,
                            ],
                            [
                              "Cancellation",
                              selectedTicketType.booking_policy
                                .cancellation_allowed
                                ? `Up to ${selectedTicketType.booking_policy.cancellation_before_hours}h before`
                                : "Non-refundable",
                              RotateCcw,
                            ],
                            [
                              "Validity",
                              selectedTicketType.booking_policy
                                .validity_type || "Fixed",
                              Calendar,
                            ],
                            [
                              "Slot Booking",
                              selectedTicketType.booking_policy
                                .slot_booking_required
                                ? "Required"
                                : "Flexible",
                              Clock,
                            ],
                          ].map(([label, value, Icon]) => (
                            <div
                              key={label}
                              className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center justify-between text-center gap-1"
                            >
                              <Icon size={16} className="text-primary shrink-0 mb-0.5" />
                              <span className="font-semibold text-on-surface capitalize">
                                {value}
                              </span>
                              <span className="text-on-surface-variant text-[11px]">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ─── Booking Summary Sidebar ─── */}
          <aside className="space-y-4">
            <div className="rounded-[28px] border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BadgeCheck size={16} />
                Booking Summary
              </div>
              <div className="mt-5 space-y-4">
                {/* Selection Info */}
                <div className="rounded-2xl bg-surface-container p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Ticket Type</span>
                    <span className="font-semibold text-on-surface">
                      {selectedTicketType?.name || "General"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Date</span>
                    <span className="font-semibold text-on-surface">
                      {dates[selectedDateIndex]?.label}
                    </span>
                  </div>
                  {selectedTimeSlot && (
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Time Slot</span>
                      <span className="font-semibold text-on-surface">
                        {selectedTimeSlot.schedule_start_time
                          ? `${selectedTimeSlot.schedule_start_time.slice(0, 5)} – ${selectedTimeSlot.schedule_end_time.slice(0, 5)}`
                          : "Selected"}
                      </span>
                    </div>
                  )}

                  {/* Nationality Dropdown */}
                  {nationalityOptions.length > 0 && (
                    <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
                      <label className="block text-xs font-semibold text-on-surface-variant">
                        Nationality
                      </label>
                      <div className="relative">
                        <select
                          value={selectedNationality}
                          onChange={(e) => setSelectedNationality(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 pr-8 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none cursor-pointer"
                        >
                          {nationalityOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Guest / Age Category Counters derived strictly from Pricing Rules */}
                <div className="space-y-3 rounded-2xl border border-outline-variant/40 p-4">
                  {guestBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-on-surface">
                          {item.category}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          ₹{item.price} each
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleGuestCountChange(item.category, -1)
                          }
                          className="h-8 w-8 rounded-full border border-outline-variant bg-surface-container-lowest text-lg flex items-center justify-center cursor-pointer hover:bg-surface-container"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center font-bold">
                          {item.count}
                        </span>
                        <button
                          onClick={() =>
                            handleGuestCountChange(item.category, 1)
                          }
                          className="h-8 w-8 rounded-full border border-primary bg-primary/10 text-lg text-primary flex items-center justify-center cursor-pointer hover:bg-primary/20"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="rounded-2xl bg-surface-container p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Total Guests</span>
                    <span className="font-semibold text-on-surface">
                      {totalTickets}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/60 pt-3 text-lg font-black text-on-surface">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isSubmitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-on-primary shadow-md hover:opacity-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CreditCard size={18} />
                {isSubmitting ? "Creating Booking…" : "Book Now"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
