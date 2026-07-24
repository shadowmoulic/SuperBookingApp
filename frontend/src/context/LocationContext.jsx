import { createContext, useState, useEffect } from "react";
import api from "../api/api";

const LocationContext = createContext();

export default LocationContext;

const sanitizeInput = (str) => {
  if (typeof str !== "string") return "";
  // Strip out any characters that aren't letters, numbers, spaces, commas, periods, or hyphens
  return str.replace(/[^a-zA-Z0-9\s,\.-]/g, "").trim();
};

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    sanitizeInput(localStorage.getItem("selectedLocation") || "Kolkata")
  );
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const loadCitiesList = async (userCoords) => {
    try {
      let allCities = [];
      let url = "/api/cities/names/";
      if (userCoords) {
        url += `?latitude=${userCoords.latitude}&longitude=${userCoords.longitude}`;
      }
      while (url) {
        const res = await api.get(url);
        if (Array.isArray(res.data)) {
          allCities = [...allCities, ...res.data];
          url = null;
        } else if (Array.isArray(res.data?.results)) {
          allCities = [...allCities, ...res.data.results];
          url = res.data.next;
        } else {
          url = null;
        }
      }
      setLocations(allCities);

      // Auto-select nearest city if not already set manually by user
      if (allCities.length > 0 && !localStorage.getItem("selectedLocation")) {
        const sanitized = sanitizeInput(allCities[0].name);
        setSelectedLocation(sanitized);
        localStorage.setItem("selectedLocation", sanitized);
      }
      return allCities;
    } catch (err) {
      console.error("Error loading cities list:", err);
      return [];
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      // If we already have a cached location or default, unblock immediately
      setLoadingLocation(false);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCoords(locCoords);
            await loadCitiesList(locCoords);
          },
          async (err) => {
            console.warn("Geolocation failed or was denied:", err);
            const allCities = await loadCitiesList(null);

            // Fetch user location via IP as fast backup with 1.5s timeout
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 1500);
              const ipRes = await fetch("https://ipapi.co/json/", { signal: controller.signal });
              clearTimeout(timeoutId);
              const ipData = await ipRes.json();
              const userCity = ipData.city;

              if (userCity && allCities.length > 0) {
                const matched = allCities.find(
                  (loc) => loc.name.toLowerCase() === userCity.toLowerCase()
                );
                if (matched && !localStorage.getItem("selectedLocation")) {
                  const sanitized = sanitizeInput(matched.name);
                  setSelectedLocation(sanitized);
                  localStorage.setItem("selectedLocation", sanitized);
                }
              }
            } catch (ipErr) {
              console.warn("IP Geolocation fallback timed out or failed:", ipErr);
            }
          },
          { timeout: 3000 }
        );
      } else {
        await loadCitiesList(null);
      }
    };

    initializeLocation();
  }, []);

  const changeLocation = (locName) => {
    const sanitized = sanitizeInput(locName);
    setSelectedLocation(sanitized);
    localStorage.setItem("selectedLocation", sanitized);
  };

  const selectedLocationObject = locations.find(
    (loc) => loc.name.toLowerCase() === selectedLocation.toLowerCase()
  ) || null;

  const contextData = {
    locations,
    selectedLocation,
    selectedLocationObject,
    coords,
    loadingLocation,
    changeLocation,
  };

  return (
    <LocationContext.Provider value={contextData}>
      {children}
    </LocationContext.Provider>
  );
};
