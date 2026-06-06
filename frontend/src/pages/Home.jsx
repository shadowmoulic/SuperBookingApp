import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import BookingCard from "../components/BookingCard";
import Loading from "../components/Loading";
import LocationContext from "../context/LocationContext";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    label: "Explore Heritage Sites",
    description: "Uncover the stories behind the world's most iconic monuments with exclusive guided tours and seamless digital booking."
  },
  {
    image: "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=1200&q=80",
    label: "Offer Closes Soon!!",
    description: "Grab exclusive entry deals, premium guided group slots, and seasonal heritage discounts today."
  },
  {
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    label: "Discover Ancient Wonders",
    description: "Journey through centuries of architectural excellence and cultural legacy with curated audio guides."
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[500px] rounded-xl relative overflow-hidden group shadow-lg mb-16">
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
            <h1 className="font-['Hanken_Grotesk'] text-2xl sm:text-5xl lg:text-[48px] lg:leading-[56px] font-bold text-[#fff] mb-4 drop-shadow-md leading-tight max-w-3xl tracking-[-0.02em]">
              {slide.label}
            </h1>
            <p className="font-['Inter'] text-[#fff]/80 text-xs sm:text-base lg:text-[18px] lg:leading-[28px] max-w-2xl mb-8 drop-shadow-sm">
              {slide.description}
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-white font-['Hanken_Grotesk'] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2 w-fit active:scale-95 shadow-md">
                Book Now <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function LocationBentoCard({ location }) {
  return (
    <Link to={`/${location.name.toLowerCase().replace(/\s+/g, '-')}`} className="block h-full">
      <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-72 md:h-80 w-full">
        {/* Background Image */}
        {location.icon_url ? (
          <img
            src={location.icon_url}
            alt={location.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa] to-[#006b55]" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 className="font-['Hanken_Grotesk'] font-bold text-[#fff] text-xl md:text-2xl leading-tight drop-shadow">
            {location.name}
          </h3>
          <p className="text-[#fff]/80 font-['Inter'] text-sm mt-1">India</p>
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function MuseumExperienceCard({ experience }) {
  const experienceId = experience.public_id;
  const images = String(experience.image_url || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const coverImage = images[0] || experience.image_url;

  return (
    <Link to={`/experience/${experienceId}`} className="block h-full group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden transition-all duration-300 relative">

        {/* Image Container */}
        <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
          <img
            src={coverImage}
            alt={experience.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Absolute Price Tag */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
            <span className="font-['JetBrains_Mono'] text-sm font-bold text-gray-900">
              ₹{Number(experience.entry_fee_base).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* City Tag */}
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 font-['Inter'] block mb-1">
              {experience.location}
            </span>
            {/* Name Title */}
            <h3 className="font-['Hanken_Grotesk'] font-bold text-lg text-gray-900 leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-2 h-12">
              {experience.name}
            </h3>
          </div>

          {/* Book Tickets Outline Button */}
          <div className="mt-auto w-full">
            <div className="w-full py-2.5 rounded-lg border-2 border-primary text-primary font-['Hanken_Grotesk'] font-semibold text-sm transition-all duration-300 group-hover:bg-primary group-hover:text-white flex items-center justify-center gap-1.5 active:scale-98">
              Book Tickets
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryGridCard({ category }) {
  const { selectedLocation } = useContext(LocationContext);
  const catSlug = category.name.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
  return (
    <Link to={`/${selectedLocation.toLowerCase().replace(/\s+/g, '-')}/${catSlug}`} className="block group">
      <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer h-36">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-all">
          {category.icon_url ? (
            <img
              src={category.icon_url}
              alt={category.name}
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <span className="material-symbols-outlined text-2xl text-primary">
              category
            </span>
          )}
        </div>
        <span className="font-['Hanken_Grotesk'] text-sm font-semibold text-gray-800 text-center line-clamp-1">
          {category.name}
        </span>
      </div>
    </Link>
  );
}

function Home() {
  const { selectedLocation } = useContext(LocationContext);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isStickyActive, setIsStickyActive] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const browseSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;

      // Determine if navbar is visible
      if (currentScrollY <= 80) {
        setIsNavbarVisible(true);
      } else if (diff > 10) {
        setIsNavbarVisible(false);
      } else if (diff < -10) {
        setIsNavbarVisible(true);
      }
      lastScrollYRef.current = currentScrollY;

      // Check browse section position relative to screen
      if (browseSectionRef.current) {
        const rect = browseSectionRef.current.getBoundingClientRect();
        // Activated when bottom of browse section is scrolled past the navbar height (approx 72px)
        if (rect.bottom < 72) {
          setIsStickyActive(true);
        } else {
          setIsStickyActive(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 font-['Inter'] text-center px-6">
        <span className="material-symbols-outlined text-4xl mb-3 select-none">error</span>
        <p className="text-sm font-semibold">Failed to load content: {error}</p>
        <button
          onClick={fetchHomeData}
          className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          Retry Loading
        </button>
      </div>
    );
  }
  if (!homeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-['Inter'] text-center px-6">
        <span className="material-symbols-outlined text-4xl mb-3 text-gray-300 select-none">sentiment_dissatisfied</span>
        <p className="text-sm font-semibold">No data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8 relative">
      {/* Sticky Categories Sub-Header */}
      {homeData && homeData.all_categories && (
        <div
          className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all duration-300 ease-in-out ${isStickyActive
            ? `opacity-100 pointer-events-auto ${isNavbarVisible ? "translate-y-[73px]" : "translate-y-0"}`
            : "-translate-y-full opacity-0 pointer-events-none"
            }`}
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {homeData.all_categories.map((category) => {
              const catSlug = category.name.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
              return (
                <Link
                  key={category.id}
                  to={`/${selectedLocation.toLowerCase().replace(/\s+/g, '-')}/${catSlug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-150 bg-white hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all text-sm font-semibold text-gray-700 whitespace-nowrap flex-shrink-0 group shadow-2xs"
                >
                  {category.icon_url ? (
                    <img
                      src={category.icon_url}
                      alt={category.name}
                      className="w-5 h-5 object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-lg text-primary">
                      category
                    </span>
                  )}
                  <span className="font-['Hanken_Grotesk']">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner />

      {/* Continue Booking */}
      {homeData.continue_booking &&
        Object.keys(homeData.continue_booking).length > 0 && (
          <section className="continue-booking-section mb-16 animate-fade-in">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-['Hanken_Grotesk'] text-2xl sm:text-3xl font-bold text-primary mb-2">
                  Continue Booking
                </h2>
                <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                  Pick up where you left your booking journey
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(homeData.continue_booking) ? (
                homeData.continue_booking.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p className="font-['Inter'] text-sm text-gray-500">No pending bookings</p>
              )}
            </div>
          </section>
        )}
      {/* Browse by Categories */}
      {homeData.all_categories && (
        <section ref={browseSectionRef} className="all-categories-section mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                Browse by Categories
              </h2>
              <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                Select a category to filter experiences
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {homeData.all_categories.map((category) => (
              <CategoryGridCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Locations */}
      {homeData.explore_locations && (
        <section className="explore-locations-section mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                {homeData.explore_locations.label}
              </h2>
              <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                Discover cultural hubs across the subcontinent
              </p>
            </div>
            <button className="text-primary font-['Hanken_Grotesk'] font-semibold flex items-center gap-1.5 hover:underline text-sm active:scale-95 transition-all">
              View All <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homeData.explore_locations.data.map((location) => (
              <LocationBentoCard key={location.id} location={location} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      {homeData.featured_categories &&
        homeData.featured_categories.map((category) => {
          const categorySlug = category.category.toLowerCase().replace(/s$/, '').replace(/\s+/g, '-');
          return (
            <section
              className="museum-section mb-16"
              key={category.category + category.pagination.current_page}
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-[32px] font-semibold leading-[40px] text-primary mb-2">
                    {category.category}
                  </h2>
                  <p className="text-on-surface-variant font-['Inter'] text-sm sm:text-base">
                    Discover unique experiences and guided tours in this category
                  </p>
                </div>
                <Link
                  to={`/${selectedLocation.toLowerCase().replace(/\s+/g, '-')}/${categorySlug}`}
                  className="text-primary font-['Hanken_Grotesk'] font-semibold flex items-center gap-1.5 hover:underline text-sm active:scale-95 transition-all"
                >
                  View All <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {category.experiences.map((exp) => (
                  <MuseumExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}

export default Home;
