import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookingReference = id;
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

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
    "10% off for first-time bookings",
    "Free digital guidebook included",
    "Priority entry unlocked",
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

    try {
      console.log(bookingReference);
      const res = await api.post("/api/payments/create/", {
        booking: bookingReference,
        payment_method: "upi",
        payment_gateway: "razorpay",
      });
      console.log(res);

      const order = res.data;
      setPaymentReference(order.payment_reference);
      openRazorpay(order, order.payment_reference);
    } catch (error) {
      console.error(error);
      alert("Unable to initiate payment. Please try again.");
    }
  };

  const openRazorpay = (order, paymentRef) => {
    const options = {
      key: order.razorpay_key || "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpay_order_id,
      name: "Zeque",
      description: `Payment for booking ${bookingReference}`,
      handler: async function (response) {
        await verifyPayment(response, paymentRef);
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const verifyPayment = async (response, paymentRef) => {
    try {
      await api.post("/api/payments/verify/", {
        payment: paymentRef,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });
      navigate("/payments/success");
    } catch (error) {
      console.log(error);
      navigate("/payments/failed");
    }
  };

  if (loadingBooking) {
    return <div className="body">Loading payment details…</div>;
  }

  if (!booking) {
    return <div className="body">Unable to load booking details.</div>;
  }

  return (
    <div className="body" style={{ background: "#f5faf6", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "2rem 1rem",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              margin: 0,
              color: "#2f4f30",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Booking reference
          </p>
          <p
            style={{
              margin: "0.35rem 0 0",
              color: "#0f2f1f",
              fontSize: "1.15rem",
            }}
          >
            {booking.reference}
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1px solid #dce9de",
            padding: "2rem",
            boxShadow: "0 18px 40px rgba(20, 72, 37, 0.08)",
          }}
        >
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#13412b" }}>
                Confirm your payment
              </h2>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  color: "#4d6d5c",
                  lineHeight: 1.6,
                }}
              >
                Pay for your booking and unlock your ticket. Apply available
                coupons to lower the final amount.
              </p>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1rem",
                  background: "#f2faf4",
                  borderRadius: 18,
                  padding: "1.2rem 1.4rem",
                }}
              >
                <div>
                  <p style={{ margin: 0, color: "#27663d", fontWeight: 700 }}>
                    Final amount
                  </p>
                  <p
                    style={{
                      margin: "0.35rem 0 0",
                      color: "#1c3f29",
                      fontSize: "1.7rem",
                      fontWeight: 800,
                    }}
                  >
                    ₹{payableAmount.toFixed(2)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{ margin: 0, color: "#6f8f7f", fontSize: "0.9rem" }}
                  >
                    Total tickets
                  </p>
                  <p
                    style={{
                      margin: "0.35rem 0 0",
                      fontWeight: 700,
                      color: "#1c3f29",
                    }}
                  >
                    {booking.total_tickets}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <label
                  style={{ fontWeight: 700, color: "#2a553e" }}
                  htmlFor="coupon"
                >
                  Apply coupon
                </label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    id="coupon"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Enter coupon code"
                    style={{
                      flex: 1,
                      padding: "0.95rem 1rem",
                      borderRadius: 14,
                      border: "1px solid #c8d7c4",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    style={{
                      borderRadius: 14,
                      border: "none",
                      background: "#1f6f44",
                      color: "#fff",
                      padding: "0.95rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p
                    style={{
                      margin: 0,
                      color: discount ? "#226c31" : "#8f3f22",
                    }}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#2a553e" }}>
                  Offers unlocked
                </p>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {offers.map((offer) => (
                    <div
                      key={offer}
                      style={{
                        background: "#eef8ed",
                        borderRadius: 14,
                        padding: "0.9rem 1rem",
                        color: "#2d5d3f",
                      }}
                    >
                      {offer}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#526c5f",
                  }}
                >
                  <span>Booking amount</span>
                  <strong>₹{Number(booking.total_amount).toFixed(2)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#526c5f",
                  }}
                >
                  <span>Discount</span>
                  <strong>-₹{discount.toFixed(2)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    color: "#1c3f29",
                  }}
                >
                  <span>Amount to pay</span>
                  <strong>₹{payableAmount.toFixed(2)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  borderRadius: 18,
                  border: "none",
                  background: "#1d6c44",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
