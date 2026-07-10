import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useContext } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginSignup from "./components/LoginSignup";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { ModalProvider, ModalContext } from "./context/ModalContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";

import { ExperienceDetails } from "./pages/ExperienceDetails";
import UnescoSites from "./pages/UnescoSites";
import TopPlaces from "./pages/TopPlaces";
import ExploreNearMe from "./pages/ExploreNearMe";

import CityIndex from "./pages/CityIndex";
import CityDetails from "./pages/CityDetails";

import StateIndex from "./pages/StateIndex";
import StateDetails from "./pages/StateDetails";

import CategoryDetails from "./pages/CategoryDetails";
import CategoryIndex from "./pages/CategoryIndex";

import TrailIndex from "./pages/TrailIndex";
import TrailDetails from "./pages/TrailDetails";
import ItineraryIndex from "./pages/ItineraryIndex";

import UserDashboard from "./pages/UserDashboard";

import BookingPage from "./pages/BookingPage";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import CheckoutPage from "./pages/CheckoutPage";

import Loading from "./components/Loading";
import LocationContext from "./context/LocationContext";

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);
  const { loadingLocation } = useContext(LocationContext);

  if (loadingLocation) {
    return <Loading />;
  }

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Chatbot />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attraction/:id" element={<ExperienceDetails />} />
          {/* <Route path="/unesco-sites" element={<UnescoSites />} /> */}
          {/* <Route path="/top-places" element={<TopPlaces />} /> */}
          {/* <Route path="/explore-near-me" element={<ExploreNearMe />} /> */}

          <Route path="/states" element={<StateIndex />} />
          <Route path="/state" element={<StateIndex />} />
          <Route path="/state/:id" element={<StateDetails />} />

          <Route path="/cities" element={<CityIndex />} />
          <Route path="/city" element={<CityIndex />} />
          <Route path="/city/:id" element={<CityDetails />} />

          <Route path="/categories" element={<CategoryIndex />} />
          <Route path="/category/:id" element={<CategoryDetails />} />

          {/* <Route path="/trails" element={<TrailIndex />} /> */}
          {/* <Route path="/trails/:trailId" element={<TrailDetails />} /> */}
          <Route path="/itineraries" element={<ItineraryIndex />} />

          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment/:id" element={<CheckoutPage />} />
          <Route path="/payments/success" element={<SuccessPage />} />
          <Route path="/payments/failed" element={<FailedPage />} />
        </Routes>
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
