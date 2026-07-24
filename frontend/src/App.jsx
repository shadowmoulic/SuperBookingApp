import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext, lazy, Suspense } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginSignup from "./components/LoginSignup";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
import Loading from "./components/Loading";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { ModalProvider, ModalContext } from "./context/ModalContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";

// Lazy-loaded routes for code splitting
const ExperienceDetails = lazy(() =>
  import("./pages/ExperienceDetails").then((m) => ({ default: m.ExperienceDetails }))
);
const AttractionDetailsTemp = lazy(() =>
  import("./pages/AttractionDetailsTemp").then((m) => ({ default: m.AttractionDetailsTemp }))
);
const BookingTemp = lazy(() =>
  import("./pages/BookingTemp").then((m) => ({ default: m.BookingTemp }))
);

const CityIndex = lazy(() => import("./pages/CityIndex"));
const CityDetails = lazy(() => import("./pages/CityDetails"));
const StateIndex = lazy(() => import("./pages/StateIndex"));
const StateDetails = lazy(() => import("./pages/StateDetails"));
const CategoryDetails = lazy(() => import("./pages/CategoryDetails"));
const CategoryIndex = lazy(() => import("./pages/CategoryIndex"));
const ItineraryIndex = lazy(() => import("./pages/ItineraryIndex"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const FailedPage = lazy(() => import("./pages/FailedPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Chatbot />
      <div>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/attraction/:id" element={<ExperienceDetails />} />
            <Route path="/attraction/:id/booking" element={<BookingPage />} />
            <Route path="/attraction-temp/:slug" element={<AttractionDetailsTemp />} />
            <Route path="/attraction-temp/:slug/booking" element={<BookingTemp />} />

            <Route path="/states" element={<StateIndex />} />
            <Route path="/state" element={<StateIndex />} />
            <Route path="/state/:id" element={<StateDetails />} />

            <Route path="/cities" element={<CityIndex />} />
            <Route path="/city" element={<CityIndex />} />
            <Route path="/city/:id" element={<CityDetails />} />

            <Route path="/categories" element={<CategoryIndex />} />
            <Route path="/category/:id" element={<CategoryDetails />} />

            <Route path="/itineraries" element={<ItineraryIndex />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/payment/:id" element={<CheckoutPage />} />
            <Route path="/payments/success" element={<SuccessPage />} />
            <Route path="/payments/failed" element={<FailedPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <LocationProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </LocationProvider>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
