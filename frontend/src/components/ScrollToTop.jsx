import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM has updated before scrolling
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Also reset root container scroll if height constraints ever return
      const root = document.getElementById("root");
      if (root) {
        root.scrollTop = 0;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
