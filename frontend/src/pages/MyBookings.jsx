import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount || "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function statusStyles(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "confirmed") {
    return {
      bg: "var(--md-sys-color-secondary-container)",
      text: "var(--md-sys-color-on-secondary-container)",
      label: "Confirmed",
    };
  }

  if (normalized === "pending") {
    return {
      bg: "var(--md-sys-color-tertiary-container)",
      text: "var(--md-sys-color-on-tertiary-container)",
      label: "Pending",
    };
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return {
      bg: "var(--md-sys-color-error-container)",
      text: "var(--md-sys-color-on-error-container)",
      label: "Cancelled",
    };
  }

  return {
    bg: "var(--md-sys-color-surface-container-high)",
    text: "var(--md-sys-color-on-surface)",
    label: status || "Unknown",
  };
}

function TicketCard({ ticket, onShowQr }) {
  const styles = statusStyles(ticket?.status);
  const reference = ticket?.booking_reference || "-";
  const experienceName = ticket?.experience_name || ticket?.experience?.name || "Experience";

  return (
    <article
      className="rounded-2xl p-5 border shadow-sm"
      style={{
        background: "var(--md-sys-color-surface-container-lowest)",
        borderColor: "var(--md-sys-color-outline-variant)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            {experienceName}
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Ref: {reference}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: styles.bg, color: styles.text }}
        >
          {styles.label}
        </span>
      </div>

      <div
        className="grid grid-cols-2 gap-3 text-sm mb-5"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        <p>Date: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{formatDate(ticket?.booking_date)}</span></p>
        <p>Slot: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{ticket?.slot_time || "-"}</span></p>
        <p>Tickets: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{ticket?.total_tickets ?? "-"}</span></p>
        <p>Total: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{formatCurrency(ticket?.total_amount)}</span></p>
      </div>

      <button
        onClick={() => onShowQr(ticket)}
        className="w-full py-2.5 rounded-xl font-semibold transition-opacity hover:opacity-90"
        style={{
          background: "var(--md-sys-color-primary)",
          color: "var(--md-sys-color-on-primary)",
        }}
      >
        Show QR
      </button>
    </article>
  );
}

function MyBookings() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const bookings = Array.isArray(bookingData?.bookings) ? bookingData.bookings : [];
  const tickets = Array.isArray(bookingData?.tickets) ? bookingData.tickets : [];

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = () => {
    setLoading(true);
    setError(null);

    api
      .get(`/api/bookings/`)
      .then((res) => {
        setBookingData(res.data || {});
      })
      .catch((err) => {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to fetch bookings";
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="body">Loading your bookings...</div>;

  if (error) {
    return (
      <div className="body">
        <p style={{ color: "var(--md-sys-color-error)" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="body space-y-10" style={{ color: "var(--md-sys-color-on-background)" }}>
      <header
        className="rounded-2xl p-5 sm:p-7 border"
        style={{
          background: "linear-gradient(135deg, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container))",
          borderColor: "var(--md-sys-color-outline-variant)",
        }}
      >
        <h1
          className="text-xl sm:text-2xl font-semibold tracking-tight"
          style={{
            color: "var(--md-sys-color-on-surface)",
            fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)",
            lineHeight: 1.1,
          }}
        >
          My Bookings
        </h1>
      </header>

      {bookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Continue Booking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const styles = statusStyles(booking?.status);
              return (
                <article
                  key={booking.id}
                  className="rounded-2xl p-5 border shadow-sm"
                  style={{
                    background: "var(--md-sys-color-surface-container-lowest)",
                    borderColor: "var(--md-sys-color-outline-variant)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--md-sys-color-on-surface)" }}
                      >
                        {booking?.experience_name || "Experience"}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                      >
                        Ref: {booking?.booking_reference || "-"}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: styles.bg, color: styles.text }}
                    >
                      {styles.label}
                    </span>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3 text-sm mb-5"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    <p>Date: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{formatDate(booking?.booking_date)}</span></p>
                    <p>Slot: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{booking?.slot_time || "-"}</span></p>
                    <p>Tickets: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{booking?.total_tickets ?? "-"}</span></p>
                    <p>Total: <span style={{ color: "var(--md-sys-color-on-surface)" }}>{formatCurrency(booking?.total_amount)}</span></p>
                  </div>

                  <button
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    className="w-full py-2.5 rounded-xl font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--md-sys-color-primary)",
                      color: "var(--md-sys-color-on-primary)",
                    }}
                  >
                    Continue Booking
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tickets.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Confirmed Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.qr_code || ticket.id || ticket.booking_reference}
                ticket={ticket}
                onShowQr={setSelectedTicket}
              />
            ))}
          </div>
        </section>
      )}

      {bookings.length === 0 && tickets.length === 0 && (
        <div
          className="rounded-2xl p-8 border text-center"
          style={{
            background: "var(--md-sys-color-surface-container-low)",
            borderColor: "var(--md-sys-color-outline-variant)",
          }}
        >
          <p className="text-lg font-medium">No bookings found.</p>
        </div>
      )}

      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "color-mix(in srgb, var(--md-sys-color-scrim) 60%, transparent)" }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border"
            style={{
              background: "var(--md-sys-color-surface-container-lowest)",
              borderColor: "var(--md-sys-color-outline-variant)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ticket QR</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1 rounded-lg text-sm"
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                Close
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              Ref: {selectedTicket?.booking_reference || "-"}
            </p>

            {selectedTicket?.qr_image ? (
              <img
                src={selectedTicket.qr_image}
                alt="Ticket QR"
                className="w-full rounded-xl border"
                style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
              />
            ) : (
              <p style={{ color: "var(--md-sys-color-error)" }}>QR image not available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
