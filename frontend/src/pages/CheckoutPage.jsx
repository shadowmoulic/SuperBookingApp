import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookingReference = id;

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  const handleDownload = () => {
    alert("Ticket PDF download initiated successfully!");
  };

  useEffect(() => {
    const fetchBooking = async () => {
      setLoadingBooking(true);
      try {
        const res = await api.get(`/api/booking/${bookingReference}`);
        setBooking(res.data);
      } catch (error) {
        console.error("Unable to fetch booking details", error);
      } finally {
        setLoadingBooking(false);
      }
    };

    if (bookingReference) {
      fetchBooking();
    }
  }, [bookingReference]);

  const payableAmount = booking ? Number(booking.total_amount) - discount : 0;

  const offers = [
    "10% off for first-time bookings applied",
    "Free digital guidebook unlocked",
    "Priority entry at gateway gate active",
  ];

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();

    if (normalized === "SAVE10") {
      const amount = booking ? Number(booking.total_amount) : 0;
      const newDiscount = Math.min(amount * 0.1, 50);
      setDiscount(newDiscount);
      setCouponMessage("Coupon applied: 10% off up to ₹50.");
      return;
    }

    setDiscount(0);
    setCouponMessage("Coupon invalid or not applicable.");
  };

  const handlePayment = async () => {
    if (!bookingReference) {
      alert("Invalid booking reference.");
      return;
    }

    setLoadingPayment(true);
    try {
      const res = await api.post("/api/payments/create/", {
        booking: bookingReference,
        payment_method: "upi",
        payment_gateway: "razorpay",
      });

      const order = res.data;
      setPaymentReference(order.payment_reference);
      openRazorpay(order, order.payment_reference);
    } catch (error) {
      console.error(error);
      alert("Unable to initiate payment. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const openRazorpay = (order, paymentRef) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || order.razorpay_key || "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpay_order_id,
      name: "Zeque",
      description: `Payment for booking ${bookingReference}`,
      handler: async function (response) {
        await verifyPayment(response, paymentRef);
      },
      modal: {
        ondismiss: function () {
          setLoadingPayment(false);
          alert("Payment window closed. The transaction was cancelled.");
        },
      },
      theme: {
        "color": "#00d4aa"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", function (response) {
      console.error("Razorpay payment failure:", response.error);
      alert(`Payment failed: ${response.error.description || "Unknown error occurred"}`);
      setLoadingPayment(false);
    });
    paymentObject.open();
  };

  const verifyPayment = async (response, paymentRef) => {
    setLoadingPayment(true);
    try {
      await api.post("/api/payments/verify/", {
        payment: paymentRef,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });
      navigate("/payments/success", {
        state: {
          bookingReference,
          discount
        }
      });
    } catch (error) {
      console.log(error);
      navigate("/payments/failed", {
        state: {
          bookingReference
        }
      });
    } finally {
      setLoadingPayment(false);
    }
  };

  if (loadingBooking) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-6 md:px-16 w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-6 flex justify-between items-center bg-white border border-gray-150 px-4 py-3 rounded-lg shadow-xs">
          <div className="h-4 w-28 bg-gray-200 skeleton rounded" />
          <div className="h-6 w-32 bg-gray-200 skeleton rounded" />
        </div>

        {/* Panel Skeleton */}
        <div className="bg-white rounded-xl border border-gray-150 p-6 md:p-8 shadow-md space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 skeleton rounded" />
            <div className="h-4 w-full bg-gray-200 skeleton rounded" />
          </div>

          {/* Amount Summary Banner Skeleton */}
          <div className="bg-gray-100 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 skeleton rounded" />
              <div className="h-8 w-36 bg-gray-200 skeleton rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 skeleton rounded" />
              <div className="h-6 w-28 bg-gray-200 skeleton rounded" />
            </div>
          </div>

          {/* Coupon Input Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 skeleton rounded" />
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-100 border border-gray-200 rounded-lg" />
              <div className="h-12 w-24 bg-gray-200 skeleton rounded-lg" />
            </div>
          </div>

          {/* Applied Benefits Skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-28 bg-gray-200 skeleton rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 border border-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Billing Details Skeleton */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-gray-200 skeleton rounded" />
              <div className="h-4 w-16 bg-gray-200 skeleton rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-gray-200 skeleton rounded" />
              <div className="h-4 w-16 bg-gray-200 skeleton rounded" />
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-gray-100">
              <div className="h-6 w-24 bg-gray-200 skeleton rounded" />
              <div className="h-7 w-28 bg-gray-200 skeleton rounded" />
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="h-14 w-full bg-gray-200 skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-['Inter']">
        Unable to load booking details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-['Inter']">
      <div className="max-w-4xl mx-auto py-8 px-6 md:px-16 w-full flex-1 flex flex-col justify-center">

        <div className="animate-fade-in w-full">

          {/* Booking Header */}
          <div className="mb-6 flex justify-between items-center bg-white border border-gray-150 px-4 py-3 rounded-lg shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-['Inter']">
              Order Placement
            </span>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-md font-mono">
              REF: {booking.reference}
            </span>
          </div>

          {/* Confirm Payment Details Panel */}
          <div className="bg-white rounded-xl border border-gray-150 p-6 md:p-8 shadow-md">
            <div className="mb-8 text-center md:text-left">
              <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Confirm your payment
              </h1>
              <p className="font-['Inter'] text-sm text-gray-500 leading-relaxed">
                Review the totals and apply promo codes to complete checkout. Authorized by gateway servers.
              </p>
            </div>

            <div className="space-y-6">

              {/* Amount Summary Banner */}
              <div className="bg-primary text-white p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-white/70 block uppercase tracking-wider mb-0.5">Final amount to pay</span>
                  <span className="font-['JetBrains_Mono'] text-3xl font-extrabold">
                    ₹{payableAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                  <span className="text-xs text-white/70 block uppercase tracking-wider mb-0.5">Total tickets</span>
                  <span className="font-['Hanken_Grotesk'] text-lg font-bold">
                    {booking.total_tickets} {booking.total_tickets > 1 ? "Visitor passes" : "Visitor pass"}
                  </span>
                </div>
              </div>

              {/* Coupon Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-['Inter']" htmlFor="coupon">
                  Apply promo code
                </label>
                <div className="flex gap-3">
                  <input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code (e.g. SAVE10)"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white text-sm font-['Inter']"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-semibold ${discount ? "text-green-600" : "text-red-500"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Offers Grid */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-['Inter'] block">
                  Applied Benefits
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 flex items-start gap-2 text-xs text-gray-600 font-['Inter']"
                    >
                      <span className="material-symbols-outlined text-sm text-primary leading-none mt-0.5">check_circle</span>
                      <span>{offer}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Details */}
              <div className="space-y-3 pt-6 border-t border-gray-100 font-['Inter'] text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Base Booking amount</span>
                  <span>₹{Number(booking.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Discount Deduction</span>
                  <span className="text-red-500">-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-100 font-bold text-gray-900">
                  <span className="font-['Hanken_Grotesk'] text-base">Grand Total</span>
                  <span className="font-['JetBrains_Mono'] text-xl text-primary">
                    ₹{payableAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={loadingPayment}
                className="w-full mt-4 py-4 bg-primary text-white font-['Hanken_Grotesk'] font-bold rounded-lg hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
              >
                {loadingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying details...
                  </>
                ) : (
                  <>
                    Pay Now
                    <span className="material-symbols-outlined text-lg leading-none">arrow_forward</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
