import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import { ExperienceDetails } from "./pages/ExperienceDetails";
import MyBookings from "./pages/MyBookings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import { LocationProvider } from "./context/LocationContext";
import { ThemeProvider } from "./context/ThemeContext";
import ModalContext from "./context/ModalContext";
import LoginSignup from "./components/LoginSignup";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import CheckoutPage from "./pages/CheckoutPage";
import CategoryPage from "./pages/CategoryPage";

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <div className="pt-[73px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/experience/:id" element={<ExperienceDetails />} />
          {/* <Route path="/booking/:id" element={<ExperienceDetails />} /> */}
          <Route path="/payment/:id" element={<CheckoutPage />} />
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
          <Route path="/:locationName" element={<CategoryPage type="location" />} />
          <Route path="/:locationName/:categoryName" element={<CategoryPage type="combined" />} />
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
