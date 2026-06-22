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
        // Step 1: fetch first page and ipapi.co in PARALLEL
        const [firstPageRes, ipRes] = await Promise.all([
          api.get("/api/cities/"),
          fetch("https://ipapi.co/json/").catch(() => null),
        ]);

        // Collect first page results
        let allCities = [];
        let nextUrl = null;
        if (Array.isArray(firstPageRes.data)) {
          allCities = firstPageRes.data;
        } else if (Array.isArray(firstPageRes.data?.results)) {
          allCities = firstPageRes.data.results;
          nextUrl = firstPageRes.data.next;
        }

        // Step 2: If there are more pages, fetch them all in PARALLEL (not sequentially)
        if (nextUrl) {
          // Collect all remaining pages by first discovering them
          const remainingPages = [];
          let url = nextUrl;
          // Only fetch additional pages sequentially to discover URLs, then batch
          // In practice, DRF pagination next URLs increment by page number
          // So we speculatively fetch page 2-9 in parallel
          const pageMatch = nextUrl.match(/[?&]page=(\d+)/);
          if (pageMatch) {
            const currentPage = parseInt(pageMatch[1]);
            // Speculatively request pages 3-9 in parallel
            const speculativePages = [];
            for (let p = currentPage + 1; p <= 9; p++) {
              const specUrl = nextUrl.replace(`page=${currentPage}`, `page=${p}`);
              speculativePages.push(api.get(specUrl).catch(() => null));
            }
            // Also fetch the known next page
            const knownNextRes = await api.get(nextUrl);
            if (Array.isArray(knownNextRes.data?.results)) {
              allCities = [...allCities, ...knownNextRes.data.results];
              nextUrl = knownNextRes.data.next;
            }
            // Settle all speculative pages
            const speculativeResults = await Promise.allSettled(speculativePages);
            for (const result of speculativeResults) {
              if (result.status === "fulfilled" && result.value) {
                const data = result.value.data;
                if (Array.isArray(data?.results) && data.results.length > 0) {
                  allCities = [...allCities, ...data.results];
                } else if (Array.isArray(data) && data.length > 0) {
                  allCities = [...allCities, ...data];
                }
              }
            }
          } else {
            // Fallback: sequential fetch if URL format is different
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
          }
        }

        // Deduplicate by city id
        const seen = new Set();
        allCities = allCities.filter((c) => {
          const key = c.id || c.public_id || c.name;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setLocations(allCities);

        // Step 3: Process IP-based location detection (already fetched in parallel above)
        if (ipRes) {
          try {
            const ipData = await ipRes.json();
            const userCity = ipData.city;
            if (userCity && allCities.length > 0) {
              const matched = allCities.find(
                (loc) => loc.name.toLowerCase() === userCity.toLowerCase()
              );
              if (matched && !localStorage.getItem("selectedLocation")) {
                setSelectedLocation(matched.name);
                localStorage.setItem("selectedLocation", matched.name);
              }
            }
          } catch {
            // ipapi.co failed silently — not critical
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

  const selectedLocationObject = locations.find(
    (loc) => loc.name.toLowerCase() === selectedLocation.toLowerCase()
  ) || null;

  const contextData = {
    locations,
    selectedLocation,
    selectedLocationObject,
    loadingLocation,
    changeLocation,
  };

  return (
    <LocationContext.Provider value={contextData}>
      {children}
    </LocationContext.Provider>
  );
};
