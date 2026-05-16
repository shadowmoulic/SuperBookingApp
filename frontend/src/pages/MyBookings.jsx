import { useEffect, useState } from "react";
import api from "../api/api";

function MyBookings() {
  const [bookingData, setBookingData] = useState({});

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = () => {
    // setLoading(true);
    api
      .get(`/api/bookings/`)
      .then((res) => {
        console.log(res.data);
        setBookingData(res.data);
        // setError(null);
      })
      .catch((err) => {
        // setError(err.message);
        console.error("Error fetching home data:", err);
      });
    //   .finally(() => setLoading(false));
  };

  return (
    <div className="body">
      {/* Pending Bookings */}
      {bookingData.bookings && Object.keys(bookingData.bookings).length > 0 && (
        <section className="continue-booking-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
            Continue Booking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(bookingData.bookings) ? (
              bookingData.bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking}></BookingCard>
              ))
            ) : (
              <p>No pending bookings</p>
            )}
          </div>
        </section>
      )}
      {/* Tickets */}
      {bookingData.tickets && Object.keys(bookingData.tickets).length > 0 && (
        <section className="continue-booking-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
            Confirmed Tickets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(bookingData.tickets) ? (
              bookingData.tickets.map((ticket) => (
                <div key={ticket.qr_code}>
                  <img src={ticket.qr_image} alt="QR Code" />
                </div>
                // <BookingCard key={booking.id} booking={booking}></BookingCard>
              ))
            ) : (
              <p>No pending bookings</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default MyBookings;
