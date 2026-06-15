import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import DemoHome from "./pages/DemoHome";
import { ExperienceDetails } from "./pages/ExperienceDetails";
import { ExperienceDemo } from "./pages/ExperienceDemo";
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
import Chatbot from "./components/Chatbot";
import SingleCategoryPage from "./pages/SingleCategoryPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StateIndex from "./pages/StateIndex";
import StateDetails from "./pages/StateDetails";
import CityDetails from "./pages/CityDetails";
import TrailDetails from "./pages/TrailDetails";
import CityIndex from "./pages/CityIndex";
import CategoryIndex from "./pages/CategoryIndex";
import TrailIndex from "./pages/TrailIndex";
import AttractionIndex from "./pages/AttractionIndex";
import ItineraryIndex from "./pages/ItineraryIndex";
import UnescoSites from "./pages/UnescoSites";
import TopPlaces from "./pages/TopPlaces";
import ExploreNearMe from "./pages/ExploreNearMe";
import BookingPage from "./pages/BookingPage";
import StatePage from "./pages/Statepage";
import CityPage from "./pages/Citypage";

function LocationRouteWrapper() {
  const { locationName } = useParams();
  const statesList = ['karnataka', 'rajasthan', 'kerala', 'maharashtra', 'himachal', 'goa', 'tamilnadu'];
  const citiesList = [
    'jaipur', 'delhi', 'agra', 'kolkata', 'hyderabad', 'hampi', 'varanasi',
    'bengaluru', 'mysuru', 'coorg', 'udaipur', 'jodhpur', 'jaisalmer',
    'kochi', 'munnar', 'alleppey', 'wayanad'
  ];

  if (locationName) {
    const norm = locationName.toLowerCase();
    if (statesList.includes(norm)) {
      return <StateDetails />;
    }
    if (citiesList.includes(norm)) {
      return <CityDetails />;
    }
  }
  return <CategoryPage type="location" />;
}

function AppContent() {
  const { isLoginModalOpen } = useContext(ModalContext);

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      {isLoginModalOpen && <LoginSignup />}
      <Chatbot />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/old-home" element={<Home />} /> */}
          {/* <Route path="/demo-home" element={<Home />} /> */}
          <Route path="/attraction/:id" element={<ExperienceDetails />} />
          <Route path="/state/:id" element={<StatePage />} />
          <Route path="/city/:id" element={<CityPage />} />
          {/* <Route path="/attraction-demo" element={<ExperienceDemo />} /> */}
          {/* <Route path="/location/:id" element={<LocationDetails />} /> */}
          <Route path="/booking/:id" element={<BookingPage />} />
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
          <Route path="/category/:id" element={<SingleCategoryPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/states" element={<StateIndex />} />
          <Route path="/cities" element={<CityIndex />} />
          <Route path="/categories" element={<CategoryIndex />} />
          {/* <Route path="/trails" element={<TrailIndex />} /> */}
          {/* <Route path="/trails/:trailId" element={<TrailDetails />} /> */}
          <Route path="/attractions" element={<AttractionIndex />} />
          {/* <Route path="/itineraries" element={<ItineraryIndex />} /> */}
          {/* <Route path="/unesco-sites" element={<UnescoSites />} /> */}
          {/* <Route path="/top-places" element={<TopPlaces />} /> */}
          {/* <Route path="/explore-near-me" element={<ExploreNearMe />} /> */}
          {/* <Route path="/:locationName" element={<LocationRouteWrapper />} /> */}
          {/* <Route path="/:locationName/:categoryName" element={<CategoryPage type="combined" />} /> */}
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
