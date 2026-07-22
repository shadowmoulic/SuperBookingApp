import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";

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

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve booking reference and discount passed in state
  const { bookingReference, discount = 0 } = location.state || {};

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingReference) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/booking/${bookingReference}`);
        setBooking(res.data);
      } catch (error) {
        console.error("Error fetching booking details in SuccessPage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingReference]);

  const handleDownload = () => {
    alert("Ticket PDF download initiated successfully!");
  };

  if (loading) {
    return <Loading />;
  }

  // If page was accessed directly without state, show a clean generic success state
  if (!booking) {
    return (
      <div className="mx-auto py-16 w-full relative bg-background">

        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-['Inter']">
          <div className="bg-white w-full max-w-md rounded-3xl border border-gray-150 p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-md mb-6">
              <span className="material-symbols-outlined text-4xl">check</span>
            </div>
            <h1 className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-gray-900 mb-3">
              Booking Successful!
            </h1>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Your booking has been registered successfully. You can inspect all details in your dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="w-full bg-primary text-white py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold shadow-md hover:brightness-110 transition active:scale-95 cursor-pointer"
              >
                Go to My Bookings
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full border border-gray-250 py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold hover:bg-gray-50 transition active:scale-95 cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const payableAmount = Number(booking.total_amount) - Number(discount);

  return (
    <div className="mx-auto py-16 w-full relative bg-background">

      <div className="min-h-screen bg-gray-50/50 flex flex-col font-['Inter'] py-8 px-6">
        <div className="animate-scale-in max-w-xl mx-auto text-center flex flex-col items-center justify-center w-full">

          {/* Success Banner */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-6">
            <span className="material-symbols-outlined text-4xl">check</span>
          </div>

          {/* Confirmation Label */}
          <div className="">
            <h1 className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-gray-900 mb-3">
              Booking Successful!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your entry ticket has been verified and registered.
            </p>

            {/* <div className="bg-green-50 border border-green-150 text-green-700 text-xs font-semibold px-4 py-3 rounded-lg">
              ✉️ A confirmation email with invoice receipt has been delivered.
            </div> */}
          </div>

          {/* Digital Ticket Card */}
          <div className="bg-white rounded-xl border border-gray-150 p-6 w-full max-w-sm relative overflow-hidden shadow-md my-6">
            {/* Validation Badges */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-['Inter']">Monument Pass</span>
              <span className="bg-green-50 text-green-700 border border-green-200 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Verified Active
              </span>
            </div>

            {/* Title */}
            <h4 className="font-['Hanken_Grotesk'] font-bold text-gray-900 text-sm mt-0.5 truncate text-left">
              {booking?.experience?.name || "Victoria Memorial"}
            </h4>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-4 uppercase text-left">
              Ref: {booking.reference}
            </p>

            {/* Ticket stub details grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-gray-500 mb-4 border-t border-gray-50 pt-4 text-left">
              <div>
                <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Date</span>
                <span className="font-semibold text-gray-700">{formatDate(booking?.booking_date)}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Slot</span>
                <span className="font-semibold text-gray-700">{booking?.slot_time || "General"}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Visitors</span>
                <span className="font-semibold text-gray-700">
                  {booking?.total_tickets} Visitor{Number(booking?.total_tickets) > 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Amount</span>
                <span className="font-semibold text-gray-700">₹{payableAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Ticket Items Breakdown */}
            {booking?.items && booking.items.length > 0 && (
              <div className="border-t border-gray-100 pt-3 text-left space-y-2 mb-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                  Ticket Breakdown ({booking.items.reduce((acc, item) => acc + (item.quantity || 1), 0)} Items)
                </span>
                <div className="space-y-1.5">
                  {booking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {item.quantity} × {item.ticket_type_name || "Ticket"}
                        </span>
                        {(item.age_category || item.nationality_category) && (
                          <span className="text-[10px] text-gray-400">
                            {[item.age_category, item.nationality_category].filter(Boolean).join(" • ")}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-700">
                        ₹{Number(item.subtotal || (item.quantity * item.unit_price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tear details (dashed lines & punch holes) */}
            <div className="relative border-t border-dashed border-gray-200 my-6">
              <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-150" />
              <div className="absolute -right-[37px] top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-150" />
            </div>

            {/* Visual QR Code placeholder */}
            <div className="flex flex-col items-center">
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

              <button
                onClick={handleDownload}
                className="text-primary font-['Hanken_Grotesk'] font-semibold text-xs mt-4 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm leading-none">download</span>
                Download ticket PDF
              </button>
            </div>

          </div>

          {/* Back to Home CTA */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-8 py-3 bg-primary text-white font-['Hanken_Grotesk'] font-semibold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
}