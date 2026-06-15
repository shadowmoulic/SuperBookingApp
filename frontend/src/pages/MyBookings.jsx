import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";
import BookingCard from "../components/BookingCard";

function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount || "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExperienceImage(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("victoria")) {
    return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("taj mahal") || normalized.includes("taj")) {
    return "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("louvre")) {
    return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("golden temple") || normalized.includes("golden")) {
    return "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("national zoo") || normalized.includes("zoo")) {
    return "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=600&q=80";
}

function getStatusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") {
    return (
      <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
        Confirmed
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
        Pending
      </span>
    );
  }
  return (
    <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
      Cancelled
    </span>
  );
}

function MyBookings() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const bookings = useMemo(() => {
    return Array.isArray(bookingData?.bookings) ? bookingData.bookings : [];
  }, [bookingData]);

  const tickets = useMemo(() => {
    return Array.isArray(bookingData?.tickets) ? bookingData.tickets : [];
  }, [bookingData]);

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

  const handleDownload = () => {
    alert("Ticket PDF download initiated successfully!");
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12 relative w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-10 space-y-2">
          <div className="h-8 w-48 bg-gray-200 skeleton rounded" />
          <div className="h-4 w-96 bg-gray-200 skeleton rounded" />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Sidebar) Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="h-5 w-32 bg-gray-200 skeleton rounded" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-gray-150 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 bg-gray-200 skeleton rounded" />
                    <div className="h-4 w-12 bg-gray-200 skeleton rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 w-16 bg-gray-200 skeleton rounded" />
                    <div className="h-3 w-12 bg-gray-200 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Tickets) Skeleton */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-50">
                <div className="h-6 w-36 bg-gray-200 skeleton rounded" />
                <div className="h-4 w-24 bg-gray-200 skeleton rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs space-y-4">
                    <div className="h-44 bg-gray-200 skeleton w-full" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 w-32 bg-gray-200 skeleton rounded" />
                      <div className="h-3 w-16 bg-gray-200 skeleton rounded" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-3 w-12 bg-gray-200 skeleton rounded" />
                        <div className="h-3 w-12 bg-gray-200 skeleton rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12 text-center font-['Inter'] text-red-500">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p>Failed to load bookings: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-12 relative w-full font-['Inter']">
      
      {/* Dashboard Header */}
      <div className="mb-10">
        <h1 className="font-['Hanken_Grotesk'] text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          My Bookings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your reservation tickets, verify active QR codes, and continue pending checkouts.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (lg:col-span-4 - Sidebar Actions) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Continue Booking Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
              <h2 className="font-['Hanken_Grotesk'] text-lg font-bold text-gray-900">
                Continue Booking
              </h2>
              {bookings.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {bookings.length}
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-150 rounded-lg">
                  <span className="material-symbols-outlined text-3xl mb-1 text-gray-300">shopping_bag</span>
                  <p className="text-xs">No pending orders. Start browsing destinations!</p>
                </div>
              )}
            </div>
          </div>

          {/* Helpline Support Card */}
          <div className="bg-primary rounded-xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-48">
            {/* Decorative background circle */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
            
            <div>
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xl">help</span>
                Need assistance?
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                Our support agents are ready to help with refunds, cancellations, and ticket gates inquiries.
              </p>
            </div>
            
            <a
              href="mailto:support@zeque.com"
              className="bg-white text-primary px-4 py-2.5 rounded-lg font-['Hanken_Grotesk'] font-semibold text-xs hover:bg-gray-50 active:scale-95 transition-all w-fit cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              Contact Support
              <span className="material-symbols-outlined text-xs leading-none">mail</span>
            </a>
          </div>

        </div>

        {/* Right Column (lg:col-span-8 - Active bookings) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Confirmed Tickets Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <div className="flex justify-between items-end mb-6 border-b border-gray-50 pb-4">
              <h2 className="font-['Hanken_Grotesk'] text-xl font-bold text-gray-900">
                Confirmed Tickets
              </h2>
              <button 
                onClick={() => alert("Showing history...")}
                className="text-primary font-['Hanken_Grotesk'] font-semibold text-xs hover:underline cursor-pointer"
              >
                View All History
              </button>
            </div>

            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => {
                  const ref = ticket?.booking_reference || "-";
                  const name = ticket?.experience_name || "Experience";
                  const experienceId = ticket?.experience_id || ticket?.experience;
                  const images = String(ticket?.experience_image || "")
                    .split(",")
                    .map((url) => url.trim())
                    .filter(Boolean);
                  const coverImage = images[0] || getExperienceImage(name);

                  return (
                    <article
                      key={ticket.qr_code || ticket.id}
                      className="group bg-white border border-gray-150 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
                    >
                      {/* Upper Media aspect ratio container */}
                      <Link
                        to={`/attraction/${experienceId}`}
                        className="relative h-44 overflow-hidden flex-shrink-0 block"
                      >
                        <img
                          src={coverImage}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          {getStatusBadge("confirmed")}
                        </div>
                      </Link>

                      {/* Lower Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h3 className="font-['Hanken_Grotesk'] font-bold text-base text-gray-900 line-clamp-1 mb-1">
                            <Link to={`/attraction/${experienceId}`} className="hover:text-primary transition-colors">
                              {name}
                            </Link>
                          </h3>
                          {/* Reference */}
                          <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-4">
                            Ref: {ref}
                          </p>

                          {/* Details Row */}
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500 mb-6 font-['Inter']">
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Date</span>
                              <span className="font-semibold text-gray-700">{formatDate(ticket?.booking_date)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Slot</span>
                              <span className="font-semibold text-gray-700">{ticket?.slot_time || "General"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Tickets</span>
                              <span className="font-semibold text-gray-700">{ticket?.total_tickets ?? "1"} Ticket</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Paid</span>
                              <span className="font-semibold text-gray-700">{formatCurrency(ticket?.total_amount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Show QR Action */}
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="w-full py-2.5 bg-primary text-white font-['Hanken_Grotesk'] font-semibold text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">qr_code_2</span>
                          Show QR Code
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">airplane_ticket</span>
                <p className="text-gray-500 font-['Inter'] text-sm">No active tickets found.</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Explore Destinations
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* QR Code Modal Overlay (Dialog) */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl relative border border-gray-150 flex flex-col items-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button icon */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Header */}
            <div className="text-center w-full px-4 mb-4">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">Monument Digital Pass</span>
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-gray-900 truncate">
                {selectedTicket?.experience_name || "Experience"}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">
                Ref: {selectedTicket?.booking_reference || "-"}
              </p>
            </div>

            {/* QR Image Visualizer */}
            <div className="bg-gradient-to-br from-primaryContainer/10 to-primary/5 p-4 rounded-xl border border-primary/10 my-4 flex items-center justify-center">
              {selectedTicket?.qr_image ? (
                <img
                  src={selectedTicket.qr_image}
                  alt="Ticket QR Code"
                  className="w-44 h-44 rounded-lg shadow-sm border border-white bg-white p-2"
                />
              ) : (
                <div className="w-44 h-44 rounded-lg bg-red-50 flex flex-col items-center justify-center border border-red-100 p-4 text-center">
                  <span className="material-symbols-outlined text-3xl text-red-500 mb-1">error</span>
                  <p className="text-xs text-red-700 font-semibold leading-relaxed">QR image not found</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center font-['Inter'] text-xs text-gray-500 leading-relaxed px-4 mb-6">
              <p className="font-semibold text-gray-700 mb-1">Gateway instructions</p>
              Present this code to the scanner at the monument entrance gate. Valid for {selectedTicket?.total_tickets ?? 1} visitor(s).
            </div>

            {/* Modal CTA actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 rounded-lg font-['Hanken_Grotesk'] text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm leading-none">download</span>
                Download PDF
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex items-center justify-center bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg font-['Hanken_Grotesk'] text-xs font-semibold hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyBookings;
