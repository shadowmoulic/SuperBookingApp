import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ChevronRight, Calendar, Clock, Plus, Minus, AlertCircle, Users, DollarSign, MapPinIcon } from "lucide-react";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

export function BookingTemp() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Booking States
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);
  const [selectedTicketType, setSelectedTicketType] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Date generation
  const dates = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        iso: date.toISOString().slice(0, 10),
        isToday: index === 0,
      };
    });
  }, []);

  useEffect(() => {
    if (slug) {
      getItem();
    }
  }, [slug]);

  const getItem = () => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${slug}`)
      .then((res) => {
        setExperience(res.data);
        setSelectedDate(dates[0].iso);
      })
      .catch((err) => {
        setError("Unable to load experience details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const currentTicketType = experience?.ticket_types?.[selectedTicketType];
  const currentSchedule = currentTicketType?.schedules?.[0];

  const currentPrice = currentTicketType?.pricing_rules?.[0]?.final_price || 0;
  const totalPrice = currentPrice * quantity;

  // Calendar generation for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-border-light shadow-sm">
        <div className="max-w-container-max mx-auto px-lg flex items-center justify-between h-20">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate(`/attraction-temp/${slug}`)}
              className="p-2 hover:bg-surface-container rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-primary" />
            </button>
            <div>
              <h1 className="font-headline-md font-bold text-on-surface">{experience?.name}</h1>
              <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                <MapPin size={14} />
                <span>{experience?.city}</span>
              </div>
            </div>
          </div>
          <button className="px-lg py-sm rounded-full border border-border-light hover:bg-surface-container transition-all text-label-md">
            Sign In
          </button>
        </div>
      </header>

      <main className="pt-24 pb-xl px-lg max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left Column: Date & Time & Ticket Selection */}
          <div className="lg:col-span-8 space-y-xl">
            {/* Select Ticket Type */}
            <section className="bg-surface-container-lowest p-xl rounded-xl border border-border-light shadow-sm">
              <h2 className="font-headline-md text-headline-md flex items-center gap-md mb-lg">
                <Users size={20} className="text-primary" />
                Select Ticket Type
              </h2>
              <div className="space-y-md">
                {experience?.ticket_types?.map((ticket, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTicketType(idx);
                      setQuantity(1);
                    }}
                    className={`w-full p-lg rounded-xl border-2 text-left transition-all ${
                      selectedTicketType === idx
                        ? "border-primary bg-primary/5"
                        : "border-border-light hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-label-md text-on-surface mb-xs">{ticket.name}</h3>
                        <p className="text-label-sm text-on-surface-variant mb-xs">{ticket.description}</p>
                        <div className="flex items-baseline gap-sm">
                          <span className="font-display-md text-primary">
                            ₹{ticket.pricing_rules?.[0]?.final_price || 0}
                          </span>
                          <span className="text-label-sm text-on-surface-variant line-through">
                            ₹{ticket.pricing_rules?.[0]?.base_price || 0}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                        {selectedTicketType === idx && (
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Select Date */}
            <section className="bg-surface-container-lowest p-xl rounded-xl border border-border-light shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="font-headline-md text-headline-md flex items-center gap-md">
                  <Calendar size={20} className="text-primary" />
                  Select Date
                </h2>
                <div className="flex items-center gap-sm">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-xs rounded-full hover:bg-surface-container"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <span className="font-label-md min-w-[140px] text-center">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-xs rounded-full hover:bg-surface-container"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-md">
                <div className="grid grid-cols-7 gap-xs text-center mb-md">
                  {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => (
                    <div key={day} className="text-on-surface-variant font-label-sm py-xs">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-xs">
                  {calendarDays.map((day, idx) => {
                    const isSelected = day && selectedDate === day.toISOString().slice(0, 10);
                    const isToday = day && day.toDateString() === new Date().toDateString();
                    const isDisabled = !day || day < new Date();

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (day && !isDisabled) {
                            setSelectedDate(day.toISOString().slice(0, 10));
                          }
                        }}
                        disabled={isDisabled}
                        className={`h-10 rounded-lg font-label-md transition-all ${
                          isSelected
                            ? "bg-primary text-on-primary font-bold"
                            : isToday
                            ? "border-2 border-primary text-primary"
                            : isDisabled
                            ? "text-on-surface-variant opacity-30 cursor-not-allowed"
                            : "hover:bg-primary-container hover:text-on-primary-container"
                        }`}
                      >
                        {day?.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Select Time Slot */}
            {currentTicketType?.schedules && currentTicketType.schedules.length > 0 && (
              <section className="bg-surface-container-lowest p-xl rounded-xl border border-border-light shadow-sm">
                <h2 className="font-headline-md text-headline-md flex items-center gap-md mb-lg">
                  <Clock size={20} className="text-primary" />
                  Select Time Slot
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {currentTicketType.schedules.map((schedule, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTimeSlot(idx)}
                      className={`p-lg rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        selectedTimeSlot === idx
                          ? "border-primary bg-primary/5"
                          : "border-border-light hover:border-primary/30"
                      }`}
                    >
                      <div>
                        <div className="font-label-md">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                        <div className="text-label-sm text-on-surface-variant font-normal">
                          {schedule.available_capacity} slots available
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                        {selectedTimeSlot === idx && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface-container-lowest border border-border-light rounded-xl shadow-lg overflow-hidden">
              {/* Alert */}
              {currentTicketType?.schedules?.[selectedTimeSlot]?.available_capacity < 20 && (
                <div className="bg-error-container text-on-error-container px-lg py-sm text-label-sm flex items-center gap-xs border-b border-error/20">
                  <AlertCircle size={16} />
                  <span className="font-semibold">
                    SELLING FAST! ONLY {currentTicketType.schedules[selectedTimeSlot].available_capacity} LEFT
                  </span>
                </div>
              )}

              <div className="p-lg space-y-lg">
                {/* Price Display */}
                <div>
                  <div className="mb-md">
                    <p className="text-label-md text-on-surface-variant mb-xs">Ticket Type</p>
                    <p className="font-display-md text-primary">
                      ₹{currentPrice.toFixed(2)} <span className="text-label-sm font-normal text-on-surface-variant">/ person</span>
                    </p>
                  </div>

                  {currentTicketType?.pricing_rules?.[0] && (
                    <div className="text-label-sm text-on-surface-variant">
                      <p>
                        Base: ₹{currentTicketType.pricing_rules[0].base_price} × {currentTicketType.pricing_rules[0].seasonal_multiplier}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="p-md border border-border-light rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-label-md">{currentTicketType?.name}</div>
                    <div className="text-label-sm text-on-surface-variant font-normal">
                      {currentTicketType?.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center hover:bg-surface-container transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-label-md w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-sm pt-base border-t border-border-light">
                  <div className="flex justify-between text-label-md">
                    <span className="text-on-surface-variant font-normal">
                      Base Price ({quantity} × ₹{currentPrice.toFixed(2)})
                    </span>
                    <span>₹{(currentPrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-label-md">
                    <span className="text-on-surface-variant font-normal">Service Fee</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-body-lg text-on-surface pt-sm">
                    <span>Total Payable</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <button className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary py-lg rounded-xl font-label-md flex items-center justify-center gap-md transition-all active:scale-95">
                  BOOK NOW
                  <ChevronRight size={20} />
                </button>

                <button
                  onClick={() => navigate(`/attraction-temp/${slug}`)}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-lg rounded-xl font-label-md transition-all"
                >
                  BACK TO DETAILS
                </button>

                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant font-normal">
                    Free cancellation up to {currentTicketType?.booking_policy?.cancellation_before_hours || 24}h before visit
                  </p>
                </div>

                {/* Booking Policy */}
                {currentTicketType?.booking_policy && (
                  <div className="space-y-xs pt-lg border-t border-border-light">
                    <p className="font-label-md text-on-surface">Booking Details</p>
                    <div className="space-y-xs text-label-sm text-on-surface-variant">
                      {currentTicketType.booking_policy.instant_confirmation && (
                        <p className="flex items-center gap-xs">
                          <span className="text-primary">✓</span> Instant Confirmation
                        </p>
                      )}
                      {currentTicketType.booking_policy.cancellation_allowed && (
                        <p className="flex items-center gap-xs">
                          <span className="text-primary">✓</span> Free Cancellation up to{" "}
                          {currentTicketType.booking_policy.cancellation_before_hours}h
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-border-light mt-xl">
        <div className="max-w-container-max mx-auto px-lg py-xl text-center">
          <p className="text-label-sm text-on-surface-variant">© 2024 ZeQue Heritage Discovery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
