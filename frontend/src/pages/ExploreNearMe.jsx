import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Compass, Navigation, X, Clock, Navigation as NavigationIcon, Loader2, CalendarPlus } from 'lucide-react';
import { getExperiences } from '../api/api';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering based on user location
const MapCenterer = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 13, { animate: true });
    }
  }, [location, map]);
  return null;
};

const ExploreNearMe = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripModalData, setTripModalData] = useState({ title: "", days: 1, currentDay: 1 });
  const [isSavingTrip, setIsSavingTrip] = useState(false);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await getExperiences();
        // Handle paginated response structure from Django
        const experiencesData = res.data.results || res.data;

        if (Array.isArray(experiencesData)) {
          // Filter out experiences without coordinates
          const validExperiences = experiencesData.filter(exp => exp.latitude && exp.longitude);
          setExperiences(validExperiences);
        } else {
          console.error("Unexpected API response format:", res.data);
        }
      } catch (err) {
        console.error("Failed to load experiences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();

    // Automatically attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to New Delhi if denied
          setUserLocation([28.6139, 77.2090]);
        }
      );
    } else {
      // Default to New Delhi if not supported
      setUserLocation([28.6139, 77.2090]);
    }
  }, []);

  const handleAddToTrip = () => {
    setShowTripModal(true);
  };

  const handleSaveTrip = async () => {
    setIsSavingTrip(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first to save a trip!");
        setIsSavingTrip(false);
        return;
      }

      // 1. Create the Trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          title: tripModalData.title,
          days: tripModalData.days
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // 2. Create the Trip Attraction
      const { error: attrError } = await supabase
        .from('trip_attractions')
        .insert({
          trip_id: trip.id,
          experience_public_id: selectedExperience.public_id,
          day_number: tripModalData.currentDay
        });

      if (attrError) throw attrError;

      setShowTripModal(false);
      setSelectedExperience(null);
      alert("Successfully added to your trip!");
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Failed to save trip. Make sure you created the Supabase schema!");
    } finally {
      setIsSavingTrip(false);
    }
  };

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#136b55]" />
          <p className="font-bold">Locating nearby heritage sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-16 flex flex-col relative">

      {/* Floating Header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200/60 flex items-center gap-3">
        <Compass className="w-5 h-5 text-[#136b55]" />
        <h1 className="font-black text-slate-900 tracking-tight text-lg">Explore India Map</h1>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude])
            );
          }
        }}
        className="absolute bottom-8 right-8 z-[400] bg-white text-slate-700 p-4 rounded-full shadow-xl hover:bg-slate-50 hover:text-[#136b55] transition-all border border-slate-200/60"
      >
        <NavigationIcon className="w-6 h-6" />
      </button>

      {/* The Map */}
      <div className="flex-1 z-0">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapCenterer location={userLocation} />

          {/* User Location Marker */}
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: `<div class="w-4 h-4 bg-[#006b55] rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
              className: 'custom-user-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>You are here</Popup>
          </Marker>

          {/* Experience Markers */}
          {experiences.map((exp) => (
            <Marker
              key={exp.id}
              position={[exp.latitude, exp.longitude]}
              eventHandlers={{
                click: () => setSelectedExperience(exp)
              }}
            >
              {/* Optional: Add a simple popup here too, but the slide-out panel handles the main UI */}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Slide-out Panel for Attraction Details */}
      {selectedExperience && (
        <div className="absolute top-20 bottom-8 left-8 z-[500] w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden animate-in slide-in-from-left-8 duration-300">
          <div className="relative h-56 bg-slate-200">
            {selectedExperience.image_url ? (
              <img src={selectedExperience.image_url} alt={selectedExperience.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <MapPin className="w-12 h-12 text-slate-400" />
              </div>
            )}
            <button
              onClick={() => setSelectedExperience(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <span className="bg-white/90 backdrop-blur-md text-[#136b55] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                {selectedExperience.category?.name || "Attraction"}
              </span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
              {selectedExperience.name}
            </h2>
            <p className="text-sm text-slate-500 mb-6 line-clamp-3">
              {selectedExperience.description || "A magnificent historical site rich with cultural heritage and architectural brilliance."}
            </p>

            <div className="flex items-center gap-6 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ticket</span>
                <span className="font-black text-slate-900 text-lg">
                  ₹{selectedExperience.entry_fee_base || 100}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Duration</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> 2-3 Hrs
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
              <button
                onClick={handleAddToTrip}
                className="w-full flex items-center justify-center gap-2 bg-[#136b55] hover:bg-[#0c4c3b] text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg hover:-translate-y-1"
              >
                <CalendarPlus className="w-5 h-5" /> Add To Trip
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all">
                Buy Tickets Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add To Trip Modal */}
      {showTripModal && (
        <div className="absolute inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Add to Trip</h3>
              <button onClick={() => setShowTripModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Trip Title</label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur Weekend Getaway"
                  value={tripModalData.title}
                  onChange={e => setTripModalData({ ...tripModalData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#136b55]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Days</label>
                  <select
                    value={tripModalData.days}
                    onChange={e => setTripModalData({ ...tripModalData, days: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#136b55]/30"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} Days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Add to Day</label>
                  <select
                    value={tripModalData.currentDay}
                    onChange={e => setTripModalData({ ...tripModalData, currentDay: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#136b55]/30"
                  >
                    {Array.from({ length: tripModalData.days }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>Day {d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveTrip}
                  disabled={isSavingTrip || !tripModalData.title.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#136b55] hover:bg-[#0c4c3b] disabled:bg-slate-300 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  {isSavingTrip ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Trip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExploreNearMe;
