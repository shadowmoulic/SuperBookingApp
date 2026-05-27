import { useEffect, useState } from "react";
import api from "../api/api";
import ExperienceCard from "../components/ExperienceCard";
import LocationCard from "../components/LocationCard";
import CategoryCard from "../components/CategoryCard";
import image1 from "../assets/image1.png";
import BookingCard from "../components/BookingCard";
import Loading from "../components/Loading";

const heroSlides = [
  {
    image: image1,
    label: "Offer Closes Soon!!",
  },
  {
    image: image1,
    label: "Explore Heritage Sites",
  },
  {
    image: image1,
    label: "Discover Ancient Wonders",
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-90 sm:h-80 md:h-[500px] lg:h-96 overflow-hidden rounded-2xl mb-8">
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg">
              {slide.label}
            </p>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? "20px" : "8px",
              height: "8px",
              background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Home() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHomeData();
  }, [currentPage]);

  const fetchHomeData = () => {
    setLoading(true);
    api
      .get(`/api/home/?${currentPage}`)
      .then((res) => {
        setHomeData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching home data:", err);
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!homeData) return <div className="error">No data available</div>;

  return (
    <div className="body">
      {/* Hero Banner  */}
      <HeroBanner />

      {/* Continue Booking */}
      {homeData.continue_booking &&
        Object.keys(homeData.continue_booking).length > 0 && (
          <section className="continue-booking-section">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
              Continue Booking
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.isArray(homeData.continue_booking) ? (
                homeData.continue_booking.map((booking) => (
                  <BookingCard key={booking.id} booking={booking}>
                    {/*  <h3>{booking.experience_name}</h3>
                    <p>Reference: {booking.booking_reference}</p>
                    <p>Date: {booking.booking_date}</p>
                    <p>Tickets: {booking.total_tickets}</p>
                    <p>Total: ${booking.total_amount}</p>
                    <p className="status">Status: {booking.status}</p>*/}
                  </BookingCard>
                ))
              ) : (
                <p>No pending bookings</p>
              )}
            </div>
          </section>
        )}

      {/* Explore Locations */}
      {homeData.explore_locations && (
        <section className="explore-locations-section pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
            {homeData.explore_locations.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {homeData.explore_locations.data.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      {homeData.featured_categories &&
        homeData.featured_categories.map((category) => (
          <section
            className="museum-section"
            key={category.category + category.pagination.current_page}
          >
            {/* Header — title only, no arrows */}
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4 mt-4">
              {category.category}
            </h2>

            {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 items-stretch"> */}
            <div className="experience-grid">
              {category.experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          </section>
        ))}

      {/* Browse by Categories */}
      {homeData.all_categories && (
        <section className="all-categories-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
            Browse by Categories
          </h2>
          <div className="relative mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {homeData.all_categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
