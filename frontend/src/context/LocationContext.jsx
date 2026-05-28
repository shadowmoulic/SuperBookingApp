import { createContext, useState, useEffect } from "react";
import api from "../api/api";

const LocationContext = createContext();

export default LocationContext;

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem("selectedLocation") || "Kolkata"
  );
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const fetchLocationsAndIP = async () => {
      try {
        // Fetch locations from DB
        const res = await api.get("/api/location/");
        const dbLocations = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setLocations(dbLocations);

        // Fetch user location via IP
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        const userCity = ipData.city;

        if (userCity && dbLocations.length > 0) {
          // Check if userCity is present in DB
          const matched = dbLocations.find(
            (loc) => loc.name.toLowerCase() === userCity.toLowerCase()
          );
          if (matched) {
            // Only update state if not already set manually by user
            if (!localStorage.getItem("selectedLocation")) {
              setSelectedLocation(matched.name);
              localStorage.setItem("selectedLocation", matched.name);
            }
          }
        }
      } catch (err) {
        console.error("Error in LocationProvider initialization:", err);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocationsAndIP();
  }, []);

  const changeLocation = (locName) => {
    setSelectedLocation(locName);
    localStorage.setItem("selectedLocation", locName);
  };

  const contextData = {
    locations,
    selectedLocation,
    loadingLocation,
    changeLocation,
  };

  return (
    <LocationContext.Provider value={contextData}>
      {children}
    </LocationContext.Provider>
  );
};
