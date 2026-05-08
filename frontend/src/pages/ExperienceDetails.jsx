import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import "../styles/ExperienceDetails.css";

export function ExperienceDetails() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    getItem();
  }, [id]);

  const getItem = () => {
    setLoading(true);
    setError("");
    api
      .get(`/api/experience/${id}`)
      .then((res) => res.data)
      .then((data) => {
        setExperience(data);
      })
      .catch(() => {
        setError("Unable to load experience details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const images = useMemo(() => {
    if (!experience?.image_url) return [];

    const parsedImages = String(experience.image_url)
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    if (!parsedImages.length) return [];
    return parsedImages;
  }, [experience]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id, images.length]);

  const goToPreviousImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hourString, minuteString] = String(timeString).split(":");
    const hour = Number(hourString);
    const minute = Number(minuteString || 0);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "N/A";
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  const reviewItems = [
    {
      id: 1,
      name: "List item",
      text: "Category trip experience exceeded our expectations.",
    },
    {
      id: 2,
      name: "List item",
      text: "Category trip was smooth, quick and well-organized.",
    },
    {
      id: 3,
      name: "List item",
      text: "Category trip was scenic and service was excellent.",
    },
  ];

  if (loading) {
    return <div className="experience-details-state">Loading experience...</div>;
  }

  if (error || !experience) {
    return (
      <div className="experience-details-state">
        {error || "Experience details not available."}
      </div>
    );
  }

  const activeImage = images[selectedImageIndex] || experience.image_url || "";

  return (
    <div className="body">
      <div className="experience-details-page">
        <section className="experience-details-card">
          <div className="experience-details-gallery">
            <div className="experience-carousel">
              {images.length > 1 && (
                <button
                  type="button"
                  className="carousel-arrow carousel-arrow-left"
                  onClick={goToPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <img
                src={activeImage}
                alt={`${experience.name} main view`}
                className="experience-image-main"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  className="carousel-arrow carousel-arrow-right"
                  onClick={goToNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="experience-carousel-dots" role="tablist">
                {images.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    className={`carousel-dot${
                      selectedImageIndex === index ? " carousel-dot-active" : ""
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="experience-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`experience-thumbnail${
                    selectedImageIndex === index
                      ? " experience-thumbnail-active"
                      : ""
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${experience.name} thumbnail ${index + 1}`}
                    className="experience-thumbnail-image"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="experience-details-main">
            <div className="experience-details-main-left">
              <h1>{experience.name}</h1>
              <section className="details-section">
                <h3 className="details-heading">Other Details</h3>
                <p className="details-text">
                  {experience.description || "No additional details available."}
                </p>
              </section>

              <section className="details-section">
                <h3 className="details-heading">Rules</h3>
                <p className="details-text">
                  {experience.is_open
                    ? "Please arrive 15 minutes early and carry a valid ID."
                    : "This experience is currently not open for bookings."}
                </p>
              </section>
            </div>

            <div className="experience-details-main-right">
              <div className="experience-meta-card">
                <p
                  className={`experience-status${
                    experience.is_open ? " experience-status-open" : ""
                  }`}
                >
                  {experience.is_open ? "Open Now" : "Closed"}
                </p>
                <p className="meta-label">Timings</p>
                <p className="meta-value">{`${formatTime(
                  experience.opening_time
                )} - ${formatTime(experience.closing_time)}`}</p>
              </div>

              <Link to={`/booking/${id}`} className="book-now-button">
                Book Now
              </Link>
            </div>
          </div>

          <div className="experience-reviews">
            <h2>Reviews</h2>
            <div className="review-list">
              {reviewItems.map((review) => (
                <article key={review.id} className="review-item">
                  <div className="review-avatar" aria-hidden="true">
                    ▲
                  </div>
                  <div className="review-copy">
                    <h4>{review.name}</h4>
                    <p>{review.text}</p>
                  </div>
                  <div className="review-rating">★★★★★</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
