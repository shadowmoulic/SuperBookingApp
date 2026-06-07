import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import LocationBentoCard from '../components/LocationBentoCard';

const CityIndex = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCities = () => {
    setLoading(true);
    api.get('/api/location/')
      .then((res) => {
        const dbLocations = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setCities(dbLocations);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong');
        console.error('Error fetching locations:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCities();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 w-full relative min-h-[400px] flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-['Hanken_Grotesk'] text-sm font-bold uppercase tracking-[0.15em]">
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          Loading Cities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 w-full relative min-h-[400px] flex flex-col items-center justify-center text-error font-['Inter'] text-center px-6">
        <span className="material-symbols-outlined text-4xl mb-3 select-none">error</span>
        <p className="text-sm font-semibold">Failed to load cities: {error}</p>
        <button
          onClick={fetchCities}
          className="mt-4 px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 w-full relative">

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col mb-8">
        <nav className="flex items-center gap-1.5 mb-4 text-on-surface-variant/70 font-semibold text-[10px] uppercase tracking-wider font-['Inter']">
          <Link to="/" className="hover:text-primary transition-colors">Destinations</Link>
          <span className="text-outline-variant">/</span>
          <span>India</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface-variant">Cities</span>
        </nav>
        <h1 className="font-['Hanken_Grotesk'] text-3xl sm:text-5xl font-extrabold text-on-surface mb-4 tracking-tight">
          Cities
        </h1>
        <p className="font-['Inter'] text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed font-normal">
          Discover incredible cities, each with its own unique charm, historical significance, and unforgettable experiences.
        </p>
      </div>

      {cities.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-on-surface-variant font-['Inter'] text-center px-6">
          <span className="material-symbols-outlined text-4xl mb-3 text-outline-variant select-none">sentiment_dissatisfied</span>
          <p className="text-sm font-semibold">No cities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <LocationBentoCard key={city.public_id || city.id} location={city} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CityIndex;
