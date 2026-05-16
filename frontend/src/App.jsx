import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
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
import PaymentPage from "./pages/PaymentPage";

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experience/:id" element={<ExperienceDetails />} />
        <Route path="/location/:id" element={<LocationDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payments/success" element={<SuccessPage />} />
        <Route path="/payments/failed" element={<FailedPage />} />
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
