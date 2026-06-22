import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import LocationContext from "../context/LocationContext";
import api from "../api/api";

function LocationDropdown({ locations, selectedLocation, onSelect, align = "left" }) {
  const scrollRef = useRef(null);
  const [thumb, setThumb] = useState({ height: 0, top: 0, visible: false });

  useEffect(() => {
    const updateThumb = () => {
      const element = scrollRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const hasOverflow = scrollHeight > clientHeight + 1;

      if (!hasOverflow) {
        setThumb({ height: 0, top: 0, visible: false });
        return;
      }

      const minThumbHeight = 36;
      const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
      const maxThumbTop = clientHeight - thumbHeight;
      const thumbTop = scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop
        : 0;

      setThumb({ height: thumbHeight, top: thumbTop, visible: true });
    };

    updateThumb();
    window.addEventListener("resize", updateThumb);

    return () => window.removeEventListener("resize", updateThumb);
  }, [locations]);

  return (
    <div
      className={`absolute top-full mt-2 w-40 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden animate-scale-in ${
        align === "right" ? "right-0 z-[110]" : "left-0 z-[70]"
      }`}
    >
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={() => {
            const element = scrollRef.current;
            if (!element) return;

            const { scrollTop, scrollHeight, clientHeight } = element;
            const minThumbHeight = 36;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
            const maxThumbTop = clientHeight - thumbHeight;
            const thumbTop = scrollHeight > clientHeight
              ? (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop
              : 0;

            setThumb((prev) => ({ ...prev, top: thumbTop }));
          }}
          className="max-h-80 overflow-y-auto py-1 pr-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {locations.map((loc) => {
            const isSelected = loc.name === selectedLocation;
            return (
              <button
                key={loc.public_id}
                type="button"
                onClick={() => onSelect(loc.name)}
                className="w-full flex items-center justify-between text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors border-none bg-transparent hover:bg-primary/5"
                style={{ transform: "none", boxShadow: "none" }}
              >
                <span className={isSelected ? "text-primary" : "text-on-surface-variant"}>{loc.name}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-primary text-xs leading-none">check</span>
                )}
              </button>
            );
          })}
        </div>

        {thumb.visible && (
          <div className="pointer-events-none absolute top-3 bottom-3 right-2 flex w-2 justify-center">
            <div className="relative h-full w-1 rounded-full bg-surface-container-high">
              <div
                className="absolute left-0 w-1 rounded-full bg-primary/60"
                style={{
                  height: `${thumb.height}px`,
                  transform: `translateY(${thumb.top}px)`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);
  const { locations, selectedLocation, changeLocation } = useContext(LocationContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLocationSelect = (locName) => {
    changeLocation(locName);
  };

  const lastScrollYRef = useRef(0);
  const [visible, setVisible] = useState(true);

  // Always show navbar when route changes
  useEffect(() => {
    setVisible(true);
    lastScrollYRef.current = 0;
  }, [pathname]);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 80) {
        setVisible(true);
      } else if (diff > 10) {
        setVisible(false);
      } else if (diff < -10) {
        setVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { isSearchOpen, openSearch, closeSearch, searchInitialQuery } = useContext(ModalContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [isNavbarLocOpen, setIsNavbarLocOpen] = useState(false);
  const [isSearchLocOpen, setIsSearchLocOpen] = useState(false);

  const navbarLocRef = useRef(null);
  const searchLocRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarLocRef.current && !navbarLocRef.current.contains(e.target)) {
        setIsNavbarLocOpen(false);
      }
      if (searchLocRef.current && !searchLocRef.current.contains(e.target)) {
        setIsSearchLocOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(
          `/api/experiences/?location=${selectedLocation}&search=${searchQuery}`
        );
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedLocation, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setSearchQuery(searchInitialQuery || "");
    }
  }, [isSearchOpen, searchInitialQuery]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[60] w-full bg-surface-container-low backdrop-blur-md border-b border-outline-variant/30 shadow-xs"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="navbar-content max-w-[1280px] mx-auto flex items-center justify-between gap-6 px-6 py-4">

          {/* Brand Logo & Nav Links */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group" aria-label="Go to home">
              <div className="logo-icon w-10 h-10 flex-shrink-0 block text-primary group-hover:scale-105 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 793.71 610.28"
                  className="w-full h-full fill-current"
                >
                  <path
                    d="M875.35,468.52q-18.79-38.46-37.61-76.92c-2-4.15-4.38-8.16-6.89-12.81-35.42,7.29-63.22-3.06-77.9-36.8-12.68-29.16-.94-52.21,23.59-69.73a47.3,47.3,0,0,0-1.72-4.62q-19.46-37.77-39-75.52c-3.55-6.86-6.59-14.13-11-20.38-10.51-14.75-27.86-19.23-46.48-12-31.14,12.16-62.09,24.81-93.11,37.29-48.61,19.56-97.15,39.26-145.81,58.69q-98.54,39.36-197.2,78.41Q177.13,360,112.08,386c-22.37,9-31,27.92-22.42,49.28,12.33,30.62,25,61.12,37.56,91.66a29.77,29.77,0,0,0,2.42,4c34-7.57,60.52,2.37,74.37,34.55,14.42,33.52-.55,58.58-28.64,78.19.74,2.14,1.37,4.26,2.21,6.29,11,26.54,21.94,53.11,33.09,79.59,3.08,7.3,5.94,14.93,10.42,21.35,11.36,16.28,29.29,19.89,50.81,11q64.2-26.41,128.33-53Q484.65,673.89,569,638.65c13.72-5.71,27.47-11.32,40.89-16.84,2.09.83,3.62,1.39,5.1,2,13.8,6.08,27.66,12,41.38,18.3,10.83,5,21.81,1.7,26.33-10.17,5.66-14.84,12.52-29.23,19.33-43.6a15.94,15.94,0,0,1,7.47-7.22q73.18-31,146.57-61.62C878.4,510.2,886,490.27,875.35,468.52ZM205.64,409.85c-2.08-.24-4.37-3-5.64-5.2-2.13-3.65-3.49-7.75-5.25-11.62s-1.94-7.86,2.69-9.64c4.36-1.67,7.4.73,9,4.89,2.1,5.48,4.12,11,6.84,18.27C210.62,407.81,208,410.11,205.64,409.85Zm16.87,42.2c-2-.05-4.41-3.43-5.66-5.84-2.43-4.67-4.16-9.7-6.9-16.33,2.49-1.56,5-4.4,7.12-4.14,2.32.28,5,3,6.27,5.41,2.53,4.81,4.19,10.08,6.71,16.45C227.55,449.21,225,452.1,222.51,452.05Zm11.18,35.74c-1.67-4.16-4.21-8.09-5.09-12.39-.47-2.28,1.12-6.44,3-7.34s6.66.34,7.6,2.05c3.39,6.18,5.69,12.94,8.41,19.5C240.67,496.77,237,496,233.69,487.79Zm16.49,41c-1.72-4.34-3.48-8.68-5.54-13.8l3.09-4.68c9.43-2.53,9.66.88,15.23,19.83C257.68,536.76,253.16,536.28,250.18,528.77Zm17.48,43.65L259.13,552c2.53-1.51,5-4.18,7.27-4s5,2.78,6.55,5a23.86,23.86,0,0,1,3.74,8.92c.54,2.69.86,6.58-.63,8.21C274.43,571.9,270.63,571.72,267.66,572.42Zm14.73,37.9c-2.14-5.46-4.25-10.93-7.11-18.29,2.47-1.48,5.06-4.27,7.45-4.11,2.19.15,4.78,3.14,6.1,5.49,2.16,3.86,3.34,8.25,5.13,12.33s.42,7-3.26,8.44S283.92,614.26,282.39,610.32ZM301,657.14c-2.77-7-5.59-14-8.57-21.52l4.41-6.07,6.73,1.81c2.8,7,5.5,13.77,8.17,20.48l-3.12,5.3Zm25.09,43.38c-2.13.77-6.59,0-7.47-1.56-3.45-6.16-5.9-12.88-9.16-20.41,1.52-1.59,3-4.52,5-4.84,2.28-.38,6.23.78,7.19,2.53a92.31,92.31,0,0,1,7.53,18C329.68,696,327.75,699.93,326.1,700.52ZM555.24,550.28c-1.14,3.26-3.65,7-6.59,8.49-8.36,4.17-17.24,7.33-25.94,10.81q-77,30.82-153.91,61.58a82,82,0,0,1-10.46,3.43c-7.9,2-14.75-1.26-18.23-8.57-4-8.47-8.5-16.79-11.59-25.6a23,23,0,0,1,0-14.13q18.25-52.57,37.4-104.83c10.42-28.53,21.28-56.9,31.91-85.35a44.1,44.1,0,0,0,1.12-5.1c-3.7,1.29-6.52,2.16-9.26,3.23q-51.56,20.11-103.1,40.27c-8.93,3.48-15.81.32-19.6-8.6-2.56-6-5.42-11.87-8.08-17.83-3.36-7.55-1.47-14,5.53-18.45a42.18,42.18,0,0,1,7.12-3.46q79-30.63,158-61.18c2.28-.88,4.62-1.64,7-2.34,8.48-2.55,14.52,0,18.76,7.89,1.26,2.32,2.49,4.66,3.87,7.25a121.14,121.14,0,0,0-11.26,61.82c.61,8.47-2.27,15.49-5,22.84q-22.8,61-45.62,122c-2.54,6.82-4.69,13.78-7.72,22.73l123.3-49.05c8.32,5.13,16.6,10.27,24.92,15.34,4.17,2.55,8.36,5.09,12.66,7.41C554.19,543,556.67,546.24,555.24,550.28ZM743.75,483.7c-16,6-32,12.11-48,18.21-1.89.72-3.71,1.62-5.48,2.41-10,22.36-20,44.47-29.82,66.61-4.74,10.67-8.7,12.42-18.8,6.42-39.77-23.61-80.27-46.15-118.8-71.64-43.32-28.66-64.1-71.19-60.4-122.83,3.1-43.3,25.34-76.77,63.54-98.65,66.54-38.13,153.18-7.71,186.63,59.95,13.7,27.7,17.59,57.11,8.78,87.42-.28,1-.72,1.86-1.45,3.74L673,421c-1-14-.36-27-3.21-39.28-11.85-51-69-77.47-115.2-53.17-22.74,11.95-35.83,31.93-38.05,57.8-3.66,42.57,25.8,82.68,67.28,92.07,20.29,4.59,39.63,1.39,58.4-8.79-5.22-11.33-10.35-22.36-15.39-33.43-3.21-7.06-2.45-9.06,5-13.37,19.73,6.15,39.74,12.45,59.79,18.62,17,5.22,34,10.28,50.92,15.41,6.62,2,10,6.87,10.33,14.87C753.24,478.31,749.46,481.58,743.75,483.7Z"
                    transform="translate(-86.38 -156.36)"
                  />
                </svg>
              </div>
              <div className="nav-logo">
                <span className="nz">Ze</span>
                <span className="nq">Que</span>
                <span className="ndot">●</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 font-['Hanken_Grotesk']">
              <Link
                to="/state"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-98 transition-all"
              >
                Explore
              </Link>
              <Link
                to="/city"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-98 transition-all"
              >
                Cities
              </Link>
              <Link
                to="/attractions"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-98 transition-all"
              >
                Attractions
              </Link>
              <Link
                to="/itineraries"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-98 transition-all"
              >
                Trip Planner
              </Link>
            </div>
          </div>

          {/* Centered Search Wrapper (Desktop) */}
          <div className="flex-1 max-w-sm relative hidden sm:flex items-center bg-surface-container border border-outline-variant rounded-full shadow-xs px-2 py-1.5 font-['Inter']">
            <div ref={navbarLocRef} className="relative flex items-center select-none border-r border-outline-variant pr-1 pl-1">
              <button
                type="button"
                onClick={() => setIsNavbarLocOpen(!isNavbarLocOpen)}
                className="flex items-center gap-0.5 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer bg-transparent border-none py-0.5 pr-2 focus:outline-none"
                style={{ transform: "none", boxShadow: "none" }}
              >
                <span className="material-symbols-outlined text-primary text-base leading-none">location_on</span>
                <span>{selectedLocation}</span>
                <span
                  className="material-symbols-outlined text-[10px] text-outline-variant ml-0.5 select-none leading-none"
                  style={{ transform: isNavbarLocOpen ? "rotate(180deg)" : "none", fontSize: "10px", transition: "transform 0.2s ease" }}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {isNavbarLocOpen && (
                <LocationDropdown
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onSelect={(locName) => {
                    handleLocationSelect(locName);
                    setIsNavbarLocOpen(false);
                  }}
                />
              )}
            </div>
            <button
              onClick={() => openSearch()}
              className="flex-1 flex items-center justify-between text-left text-xs text-outline-variant pl-3 pr-2 py-0.5 focus:outline-none cursor-pointer"
              style={{ transform: "none", boxShadow: "none" }}
            >
              <span>Search experiences...</span>
              <span className="material-symbols-outlined text-outline-variant text-lg">search</span>
            </button>
          </div>

          {/* Right-aligned User Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openSearch()}
              className="sm:hidden flex w-10 h-10 rounded-full border border-outline-variant text-on-surface items-center justify-center hover:text-primary hover:border-primary transition-all shadow-xs cursor-pointer bg-surface-container-lowest"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <Link
              to="/dashboard"
              className="lg:flex hidden border border-outline-variant text-on-surface hover:text-primary hover:border-primary px-4 py-2 rounded-full text-xs sm:text-sm font-bold font-['Hanken_Grotesk'] tracking-wide transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm"
            >
              <span className="material-symbols-outlined text-base leading-none">shopping_bag</span>
              My Bookings
            </Link>
            <Link
              to="/dashboard"
              className="lg:hidden flex w-10 h-10 rounded-full border border-outline-variant text-on-surface hover:text-primary hover:border-primary items-center justify-center transition-all shadow-xs bg-surface-container-lowest"
              aria-label="My Bookings"
            >
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
            </Link>

            {user ? (
              <>
                <button
                  onClick={logout}
                  className="sm:flex hidden bg-primary text-on-primary hover:brightness-110 px-5 py-2 rounded-full text-xs sm:text-sm font-bold font-['Hanken_Grotesk'] tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
                >
                  <span className="material-symbols-outlined text-base leading-none">logout</span>
                  Logout
                </button>
                <button
                  onClick={logout}
                  className="sm:hidden flex w-10 h-10 rounded-full bg-primary text-on-primary items-center justify-center hover:brightness-110 transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined text-lg leading-none">logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="lg:flex hidden bg-primary text-on-primary hover:brightness-110 px-5 py-2 rounded-full text-xs sm:text-sm font-bold font-['Hanken_Grotesk'] tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
                >
                  <span className="material-symbols-outlined text-base leading-none">login</span>
                  Login
                </button>
                <button
                  onClick={openLoginModal}
                  className="lg:hidden flex w-10 h-10 rounded-full bg-primary text-on-primary items-center justify-center hover:brightness-110 transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Login"
                >
                  <span className="material-symbols-outlined text-lg leading-none">login</span>
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Search Overlay/Modal Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-10 sm:pt-20">
          <div className="bg-surface-container-lowest w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-hidden flex flex-col sm:max-h-[80vh] animate-scale-in sm:border sm:border-outline-variant shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-outline-variant flex items-center gap-3">
              <button
                onClick={() => closeSearch()}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer sm:hidden flex items-center"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <span className="material-symbols-outlined text-outline-variant hidden sm:block">search</span>
              <input
                type="text"
                autoFocus
                placeholder="Search destinations or experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-on-surface placeholder-outline-variant focus:outline-none focus:ring-0 text-sm font-['Inter']"
              />

              {/* Custom Location Selector in Search Overlay */}
              <div ref={searchLocRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSearchLocOpen(!isSearchLocOpen)}
                  className="flex items-center gap-1 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 transition-all text-xs font-semibold text-on-surface cursor-pointer"
                  style={{ transform: "none", boxShadow: "none" }}
                >
                  <span className="material-symbols-outlined text-primary text-xs leading-none">location_on</span>
                  <span>{selectedLocation}</span>
                  <span
                    className="material-symbols-outlined text-[10px] text-outline-variant select-none ml-0.5 leading-none"
                    style={{ transform: isSearchLocOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>

                {isSearchLocOpen && (
                  <LocationDropdown
                    align="right"
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onSelect={(locName) => {
                      handleLocationSelect(locName);
                      setIsSearchLocOpen(false);
                    }}
                  />
                )}
              </div>

              <button
                onClick={() => closeSearch()}
                className="text-outline-variant hover:text-on-surface-variant cursor-pointer hidden sm:block"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px] no-scrollbar">
              {searching ? (
                <div className="flex items-center justify-center py-10 text-outline-variant font-['Inter'] gap-2 text-xs">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-outline-variant text-sm font-['Inter']">
                  <span className="material-symbols-outlined text-3xl mb-1 text-outline-variant block">search_off</span>
                  No experiences found
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((exp) => {
                    const expId = exp.public_id || exp.id;
                    return (
                      <Link
                        key={expId}
                        to={`/attraction/${exp.slug}`}
                        onClick={() => closeSearch()}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
                      >
                        <img
                          src={exp.image_url ? exp.image_url.split(",")[0] : ""}
                          alt={exp.name}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-container-low flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-['Hanken_Grotesk'] text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {exp.name}
                          </h4>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mt-0.5">
                            {exp.category} • {exp.location}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-['JetBrains_Mono'] text-xs font-bold text-on-surface block">
                            ₹{Number(exp.entry_fee_base).toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
