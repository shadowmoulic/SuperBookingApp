import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Zap, ChevronRight, Grid3X3, Users, Lock, MoreVertical } from "lucide-react";
import api from "../api/api";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "../components/Loading";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800";

export function AttractionDetailsTemp() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      getItem();
    }
  }, [slug]);

  const getItem = () => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${slug}`)
      .then((res) => {
        setExperience(res.data);
      })
      .catch((err) => {
        setError("Unable to load experience details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const images = useMemo(() => {
    return String(experience?.image_url || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }, [experience]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-border-light shadow-sm">
        <div className="max-w-container-max mx-auto px-lg flex items-center justify-between h-20">
          <div className="flex items-center gap-xl">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-container rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-primary" />
            </button>
            <span className="text-headline-md font-bold text-primary">ZeQue</span>
            <nav className="hidden md:flex gap-lg">
              <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Museums</a>
              <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Heritage</a>
              <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Temples</a>
              <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Wildlife</a>
            </nav>
          </div>
          <button className="px-lg py-sm rounded-full border border-border-light hover:bg-surface-container transition-all text-label-md">
            Sign In
          </button>
        </div>
      </header>

      <main className="pt-24 pb-xl px-lg max-w-container-max mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-md">
          <a className="hover:text-primary" href="#">Home</a>
          <ChevronRight size={14} />
          <a className="hover:text-primary" href="#">{experience?.city || "India"}</a>
          <ChevronRight size={14} />
          <span className="text-on-surface font-semibold">{experience?.name}</span>
        </nav>

        {/* Hero Title & Badges */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
          <div>
            <h1 className="text-display-lg font-bold mb-xs">{experience?.name}</h1>
            <div className="flex flex-wrap items-center gap-md text-label-md">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <MapPin size={18} className="text-primary" />
                <span>{experience?.address}</span>
              </div>
              {experience?.highlights?.some(h => h.title.includes("Skip-the-Line")) && (
                <div className="flex items-center gap-xs text-primary font-semibold">
                  <Zap size={18} />
                  <span>Instant Confirmation</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-high px-md py-xs rounded-lg">
            <div className="flex items-center text-accent-gold">
              <Star size={18} fill="#FEBB02" />
              <span className="font-bold ml-1">{experience?.average_rating}</span>
            </div>
            <span className="text-on-surface-variant border-l border-outline-variant pl-sm">
              ({experience?.total_reviews || 0} Reviews)
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md h-[400px] md:h-[600px] mb-xl">
          {images.length > 0 && (
            <>
              <div className="md:col-span-2 relative group overflow-hidden rounded-xl">
                <img
                  src={images[0] || FALLBACK_IMAGE}
                  alt={experience?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="hidden md:flex md:flex-col gap-md md:col-span-1">
                {images[1] && (
                  <div className="h-1/2 relative group overflow-hidden rounded-xl">
                    <img
                      src={images[1]}
                      alt={experience?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                {images[2] && (
                  <div className="h-1/2 relative group overflow-hidden rounded-xl">
                    <img
                      src={images[2]}
                      alt={experience?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
              </div>
              {images[3] && (
                <div className="relative group overflow-hidden rounded-xl md:col-span-1">
                  <img
                    src={images[3]}
                    alt={experience?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {images.length > 4 && (
                    <button className="absolute bottom-md right-md bg-white/90 backdrop-blur px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:bg-white transition-all shadow-lg">
                      <Grid3X3 size={18} />
                      Show all photos ({images.length})
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-xl">
          {/* Main Content */}
          <div className="flex-grow space-y-xl">
            {/* About Section */}
            <section>
              <h2 className="text-headline-lg font-bold mb-md">About {experience?.name}</h2>
              <div className="p-lg bg-surface-container-low rounded-xl border border-border-light leading-relaxed text-on-surface-variant">
                <p className="mb-md">{experience?.description}</p>
                <p>{experience?.subtitle}</p>
              </div>
            </section>

            {/* Highlights */}
            {experience?.highlights && experience.highlights.length > 0 && (
              <section>
                <h3 className="text-headline-md font-bold mb-md">Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {experience.highlights.map((highlight, idx) => (
                    <div key={idx} className="p-lg bg-white rounded-xl border border-border-light hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-sm">
                        <Star size={20} />
                      </div>
                      <h4 className="font-label-md text-on-surface">{highlight.title}</h4>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Attributes / Pro Tips */}
            {experience?.attributes && experience.attributes.length > 0 && (
              <section>
                <h3 className="text-headline-md font-bold mb-md">Pro Tips for Your Visit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {experience.attributes.map((attr, idx) => (
                    <div key={idx} className="p-lg bg-white rounded-xl border border-border-light flex gap-md">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h4 className="font-label-md mb-xs">{attr.key}</h4>
                        <p className="text-label-sm text-on-surface-variant">{attr.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ticket Features from First Ticket Type */}
            {experience?.ticket_types?.[0]?.ticket_features && experience.ticket_types[0].ticket_features.length > 0 && (
              <section>
                <h3 className="text-headline-md font-bold mb-md">What's Included</h3>
                <div className="space-y-sm">
                  {experience.ticket_types[0].ticket_features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                      <span className="text-primary font-bold">✓</span>
                      <div>
                        <p className="font-label-md text-on-surface">{feature.title}</p>
                        {feature.description && (
                          <p className="text-label-sm text-on-surface-variant">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            {experience?.reviews?.results && experience.reviews.results.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-md">
                  <h3 className="text-headline-md font-bold">Traveler Reviews</h3>
                  <button className="text-primary font-label-md underline hover:text-on-primary-fixed-variant transition-colors">
                    See All Reviews
                  </button>
                </div>
                <div className="space-y-md">
                  {experience.reviews.results.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="p-lg bg-surface-container-low rounded-xl border border-border-light">
                      <div className="flex items-center justify-between mb-sm">
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed">
                            {review.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">{review.user_name}</p>
                            <p className="text-[12px] text-on-surface-variant">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-accent-gold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? "fill-current" : ""}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-body-md text-on-surface-variant">"{review.review_text}"</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - CTA to Booking */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 p-lg bg-white rounded-xl border border-border-light shadow-lg space-y-lg">
              <div className="p-sm bg-error-container/20 border border-error/10 rounded-lg flex items-center gap-sm">
                <span className="text-[20px] animate-pulse">🔥</span>
                <span className="text-on-error-container font-label-md">
                  {experience?.ticket_types?.reduce((sum, t) => sum + (t.schedules?.[0]?.available_capacity || 0), 0)} slots available
                </span>
              </div>

              <div>
                <p className="font-headline-md text-on-surface mb-xs">
                  ₹{experience?.ticket_types?.[0]?.pricing_rules?.[0]?.final_price || experience?.entry_fee_base}
                </p>
                <p className="text-label-md text-on-surface-variant">
                  / {experience?.ticket_types?.[0]?.name}
                </p>
              </div>

              <button
                onClick={() => navigate(`/attraction-temp/${slug}/booking`)}
                className="w-full py-md bg-primary text-on-primary rounded-xl font-label-md flex items-center justify-center gap-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all shadow-md"
              >
                BOOK NOW
                <ChevronRight size={20} />
              </button>

              <p className="text-center text-label-sm text-on-surface-variant">
                Free cancellation until 24h before
              </p>

              {experience?.ticket_types?.[0]?.booking_policy && (
                <div className="space-y-xs pt-lg border-t border-border-light">
                  <div className="text-label-sm text-on-surface-variant">
                    <p className="font-semibold text-on-surface mb-xs">Booking Policy</p>
                    {experience.ticket_types[0].booking_policy.instant_confirmation && (
                      <p className="flex items-center gap-xs">✓ Instant Confirmation</p>
                    )}
                    {experience.ticket_types[0].booking_policy.cancellation_allowed && (
                      <p className="flex items-center gap-xs">
                        ✓ Free Cancellation up to {experience.ticket_types[0].booking_policy.cancellation_before_hours}h
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-border-light mt-xl">
        <div className="max-w-container-max mx-auto px-lg py-xl text-center">
          <p className="text-label-sm text-on-surface-variant">© 2024 ZeQue Heritage Discovery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
