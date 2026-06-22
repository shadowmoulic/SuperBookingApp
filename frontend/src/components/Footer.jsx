import { useContext } from "react";
import { Link } from "react-router-dom";
import LocationContext from "../context/LocationContext";
import ThemeContext from "../context/ThemeContext";

export default function Footer() {
  const { selectedLocation } = useContext(LocationContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();
  const locSlug = selectedLocation ? selectedLocation.toLowerCase().replace(/\s+/g, "-") : "all";

  return (
    <footer className="mt-16 relative overflow-hidden bg-surface-container-low border-t border-outline-variant/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Branding Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="mb-6">
              <div className="nav-logo">
                <span className="nz">Ze</span>
                <span className="nq">Que</span>
                <span className="ndot">●</span>
              </div>
              <p className="text-on-surface-variant/80 text-sm mt-3">
                Discover, explore, and book heritage monuments with ease.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-on-surface/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5 text-on-surface"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-on-surface/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5 text-on-surface"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-on-surface/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 text-on-surface"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-on-surface/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5 text-on-surface"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>


          <nav className="col-span-1">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Discover</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={`/${locSlug}/museum`}
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Museums
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locSlug}/religious-site`}
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Temples & Heritage
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locSlug}/fort`}
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Forts & Palaces
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locSlug}/all`}
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  All Experiences
                </Link>
              </li>
            </ul>
          </nav>

          {/* Help & Support */}
          <nav className="col-span-1">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              Help & Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Booking FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal & Privacy */}
          <nav className="col-span-1">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              Legal & Privacy
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Security
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant/30 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-on-surface-variant">
            © {currentYear} ZeQue. All rights reserved. | Bringing history to life
          </p>
          <div className="flex gap-4 flex-wrap justify-center items-center">
            <a
              href="#"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Accessibility
            </a>
            <span className="text-outline-variant">•</span>
            <a
              href="#"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Sitemap
            </a>
            <span className="text-outline-variant">•</span>
            <a
              href="#"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Feedback
            </a>
            <span className="text-outline-variant">•</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none py-0 px-1 cursor-pointer focus:outline-none"
              style={{ transform: 'none', boxShadow: 'none' }}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              <span className="material-symbols-outlined text-base leading-none">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
              <span>{theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl"
          style={{ animation: "float 6s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-container rounded-full mix-blend-multiply filter blur-3xl"
          style={{ animation: "float 8s ease-in-out infinite reverse" }}
        ></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </footer>
  );
}
