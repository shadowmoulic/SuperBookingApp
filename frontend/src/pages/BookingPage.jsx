import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import "../styles/BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${id}`)
      .then((res) => setExperience(res.data))
      .catch(() => setError("Unable to load booking details."))
      .finally(() => setLoading(false));
  }, [id]);

  const dates = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 8 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        iso: date.toISOString().slice(0, 10),
      };
    });
  }, []);

  const categorySlug = experience?.category?.toLowerCase() || "tour";

  const tourOptions = [
    {
      id: "slot-1",
      title: "Slot A",
      time: "10:00 hrs",
      details: "Guided entry and audio support.",
      price: experience?.entry_fee_base ?? 20,
    },
    {
      id: "slot-2",
      title: "Slot B",
      time: "12:00 hrs",
      details: "Small group tour with museum highlights.",
      price: experience?.entry_fee_base ?? 20,
    },
    {
      id: "slot-3",
      title: "Slot C",
      time: "14:00 hrs",
      details: "Exclusive late afternoon entry.",
      price: experience?.entry_fee_base ?? 20,
    },
    {
      id: "slot-4",
      title: "Slot D",
      time: "16:00 hrs",
      details: "Family-friendly tour with priority seating.",
      price: experience?.entry_fee_base ?? 20,
    },
  ];

  const concertOptions = [
    {
      id: "seat-vip",
      title: "VIP Box",
      details: "Front row, best sound.",
      price: (experience?.entry_fee_base ?? 20) + 45,
    },
    {
      id: "seat-floor",
      title: "Floor",
      details: "Close to stage, limited availability.",
      price: (experience?.entry_fee_base ?? 20) + 25,
    },
    {
      id: "seat-balcony",
      title: "Balcony",
      details: "Elevated view, comfortable seating.",
      price: (experience?.entry_fee_base ?? 20) + 10,
    },
    {
      id: "seat-general",
      title: "General Admission",
      details: "Great value with open seating.",
      price: experience?.entry_fee_base ?? 20,
    },
  ];

  const museumOptions = [
    {
      id: "access-general",
      title: "General Entry",
      details: "Access to main galleries and regular exhibitions.",
      price: experience?.entry_fee_base ?? 20,
    },
    {
      id: "access-premium",
      title: "Premium Access",
      details: "Includes priority entry and special exhibits.",
      price: (experience?.entry_fee_base ?? 20) + 18,
    },
    {
      id: "access-guided",
      title: "Guided Tour",
      details: "Curator-led tour with expert commentary.",
      price: (experience?.entry_fee_base ?? 20) + 32,
    },
  ];

  const activeOptions = categorySlug.includes("concert")
    ? concertOptions
    : categorySlug.includes("museum")
      ? museumOptions
      : tourOptions;

  useEffect(() => {
    if (!selectedOption && activeOptions.length) {
      setSelectedOption(activeOptions[0]);
    }
  }, [activeOptions, selectedOption]);

  const selectedPrice =
    selectedOption?.price ?? experience?.entry_fee_base ?? 0;
  const totalPrice = selectedPrice * ticketCount;

  const handleTicketCountChange = (delta) => {
    setTicketCount((current) => Math.max(1, current + delta));
  };

  const handleBuyNow = async () => {
    if (!selectedOption || !experience) {
      alert("Please select an option before booking");
      return;
    }

    const bookingData = {
      experience: experience.public_id,
      booking_date: dates[selectedDateIndex].iso,
      total_tickets: ticketCount.toString(),
      total_amount: totalPrice.toString(),
    };

    try {
      const response = await api.post("/api/booking/create/", bookingData);
      console.log("Booking created successfully:", response.data);
      alert("Booking created successfully! Redirecting to payment...");
      navigate(`/payment/${response.data.booking_reference}`);
    } catch (error) {
      console.error("Booking creation failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create booking. Please try again.",
      );
    }
  };

  const optionLabel = categorySlug.includes("concert")
    ? "Seat"
    : categorySlug.includes("museum")
      ? "Access"
      : "Slot";

  const bookingSubtitle = experience
    ? `${experience.location || "Location"} • ${experience.category || "Tour"}`
    : "Loading booking details";

  if (loading) {
    return <div className="booking-page">Loading booking experience…</div>;
  }

  if (error) {
    return <div className="booking-page">{error}</div>;
  }

  return (
    <div className="booking-page">
      <div className="booking-card">
        <div className="booking-details">
          <div className="booking-hero">
            <h1>{experience.name || "Experience Booking"}</h1>
            <p>
              {experience.description ||
                "Choose the right booking option for this experience."}
            </p>
          </div>

          <div className="booking-section">
            <div className="section-title">
              <h2>Other Details</h2>
              <span>{bookingSubtitle}</span>
            </div>
            <div className="booking-dates">
              {dates.map((date, index) => (
                <button
                  key={date.iso}
                  type="button"
                  className={`date-chip ${selectedDateIndex === index ? "date-chip-active" : ""}`}
                  onClick={() => setSelectedDateIndex(index)}
                >
                  <small>{date.weekday}</small>
                  <strong>{date.label}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* <div className="booking-section booking-dynamic">
            <div className="section-title">
              <h2>
                {categorySlug.includes("concert")
                  ? "Seat Selection"
                  : categorySlug.includes("museum")
                    ? "Access Levels"
                    : "Available Slots"}
              </h2>
              <span>Select the best fit for your visit</span>
            </div>

            {categorySlug.includes("concert") ? (
              <div className="seat-grid">
                {concertOptions.map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    className={`seat-card ${selectedOption?.id === seat.id ? "selected-card" : ""}`}
                    onClick={() => setSelectedOption(seat)}
                  >
                    <p className="seat-title">{seat.title}</p>
                    <p className="seat-text">{seat.details}</p>
                    <p className="seat-price">₹{seat.price}</p>
                  </button>
                ))}
              </div>
            ) : categorySlug.includes("museum") ? (
              <div className="access-list">
                {museumOptions.map((access) => (
                  <button
                    key={access.id}
                    type="button"
                    className={`access-card ${selectedOption?.id === access.id ? "selected-card" : ""}`}
                    onClick={() => setSelectedOption(access)}
                  >
                    <p className="access-title">{access.title}</p>
                    <p className="access-text">{access.details}</p>
                    <p className="access-price">₹{access.price}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="slot-list">
                {tourOptions.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`slot-card ${selectedOption?.id === slot.id ? "selected-card" : ""}`}
                    onClick={() => setSelectedOption(slot)}
                  >
                    <p className="slot-title">{slot.title}</p>
                    <p className="slot-text">Entry Time: {slot.time}</p>
                    <p className="slot-text">{slot.details}</p>
                    <p className="slot-price">₹{slot.price}</p>
                  </button>
                ))}
              </div>
            )}
            </div> */}
        </div>

        <aside className="booking-sidebar">
          <div className="summary-card">
            <div className="summary-row">
              <p>{optionLabel}</p>
              <strong>{selectedOption?.title ?? "No option selected"}</strong>
            </div>
            <div className="summary-row">
              <p>Price</p>
              <strong>₹{selectedPrice}</strong>
            </div>
            <div className="summary-row">
              <p>Date</p>
              <strong>{dates[selectedDateIndex]?.label}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>₹{totalPrice}</strong>
            </div>
          </div>

          <div className="booking-ticket-card">
            <p className="section-title">
              <span>Tickets</span>
            </p>
            <div className="quantity-control">
              <button type="button" onClick={() => handleTicketCountChange(-1)}>
                -
              </button>
              <span>{ticketCount}</span>
              <button type="button" onClick={() => handleTicketCountChange(1)}>
                +
              </button>
            </div>
            <p className="booking-note">
              Adjust ticket quantity to update your total automatically.
            </p>
          </div>

          <div className="action-buttons">
            {/* <button
              type="button"
              className="button-primary"
              onClick={() => console.log("Add to cart")}
            >
              Add to Cart
            </button> */}
            <button
              type="button"
              className="button-secondary"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BookingPage;
