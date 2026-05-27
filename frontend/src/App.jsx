import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import { ExperienceDetails } from "./pages/ExperienceDetails";
import LocationPage from "./pages/LocationPage";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import ModalContext from "./context/ModalContext";
import LoginSignup from "./components/LoginSignup";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import PaymentPage from "./pages/PaymentPage";
import SingleCategoryPage from "./pages/SingleCategoryCard";

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experience/:id" element={<ExperienceDetails />} />
        <Route path="/location/:id" element={<LocationPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route path="/payments/success" element={<SuccessPage />} />
        <Route path="/payments/failed" element={<FailedPage />} />
        <Route path="/category/:id" element={<SingleCategoryPage />} />
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
