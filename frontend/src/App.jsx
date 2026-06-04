import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import DemoHome from "./pages/DemoHome";
import { ExperienceDetails } from "./pages/ExperienceDetails";
import { LocationDetails } from "./pages/LocationDetails";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import ModalContext from "./context/ModalContext";
import LoginSignup from "./components/LoginSignup";
import Footer from "./components/Footer";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import Chatbot from "./components/Chatbot";

import PaymentPage from "./pages/PaymentPage";
import SingleCategoryPage from "./pages/SingleCategoryPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StateIndex from "./pages/StateIndex";
import CityIndex from "./pages/CityIndex";
import CategoryIndex from "./pages/CategoryIndex";
import TrailIndex from "./pages/TrailIndex";
import AttractionIndex from "./pages/AttractionIndex";
import ItineraryIndex from "./pages/ItineraryIndex";
import UnescoSites from "./pages/UnescoSites";
import TopPlaces from "./pages/TopPlaces";
import ExploreNearMe from "./pages/ExploreNearMe";

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<DemoHome />} />
        <Route path="/experience/:id" element={<ExperienceDetails />} />
        <Route path="/location/:id" element={<LocationDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />


        <Route path="/payments/success" element={<SuccessPage />} />
        <Route path="/payments/failed" element={<FailedPage />} />
        <Route path="/category/:id" element={<SingleCategoryPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/states" element={<StateIndex />} />
        <Route path="/cities" element={<CityIndex />} />
        <Route path="/categories" element={<CategoryIndex />} />
        <Route path="/trails" element={<TrailIndex />} />
        <Route path="/attractions" element={<AttractionIndex />} />
        <Route path="/itineraries" element={<ItineraryIndex />} />
        <Route path="/unesco-sites" element={<UnescoSites />} />
        <Route path="/top-places" element={<TopPlaces />} />
        <Route path="/explore-near-me" element={<ExploreNearMe />} />
      </Routes>
      <Footer />
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
