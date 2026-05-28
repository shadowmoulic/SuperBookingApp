import { useNavigate, Link } from "react-router-dom";

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

export default function BookingCard({ booking }) {
  const navigate = useNavigate();
  const experienceId = booking?.experience_id || booking?.experience || booking?.id;

  const images = String(booking?.experience_image || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const coverImage = images[0] || "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=600&q=80";

  return (
    <div
      className="border border-gray-150 rounded-lg p-4 bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Cover Image */}
        <Link
          to={`/experience/${experienceId}`}
          className="block w-full h-32 rounded-lg overflow-hidden mb-3 relative group"
        >
          <img
            src={coverImage}
            alt={booking?.experience_name || "Experience"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
            <span className="text-[10px] text-white font-medium flex items-center gap-1 font-['Inter']">
              View details
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </span>
          </div>
        </Link>

        {/* Card Header & Status */}
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <Link
              to={`/experience/${experienceId}`}
              className="font-['Hanken_Grotesk'] font-bold text-sm text-gray-900 line-clamp-1 hover:text-primary transition-colors"
            >
              {booking?.experience_name || "Experience"}
            </Link>
            {getStatusBadge(booking?.status)}
          </div>
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">
            Ref: {booking?.booking_reference || booking?.reference || "-"}
          </span>
        </div>

        {/* Booking Parameters Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500 mb-5 border-t border-gray-100/50 pt-3">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Date</span>
            <span className="font-semibold text-gray-700">{formatDate(booking?.booking_date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Slot</span>
            <span className="font-semibold text-gray-700">{booking?.slot_time || "General"}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Tickets</span>
            <span className="font-semibold text-gray-700">{booking?.total_tickets ?? "-"}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Total</span>
            <span className="font-semibold text-gray-700">{formatCurrency(booking?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Continue Action Button */}
      <button
        onClick={() => navigate(`/payment/${booking?.booking_reference || booking?.reference}`)}
        className="w-full py-2.5 bg-primary text-white rounded-lg font-['Hanken_Grotesk'] font-semibold text-xs hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
      >
        Continue Booking
        <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
      </button>
    </div>
  );
}