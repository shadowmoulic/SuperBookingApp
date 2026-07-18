# Frontend Modules - Page Routers & Views

This document catalogizes all React page views registered in the **ZeQue** router, specifying page layouts and backend integration requirements.

---

## 1. Page Catalog

### 1.1 Discovery & Portals
- **`Home.jsx`**:
  - The main landing view. Contains promotional banners, city sliders, a search utility, and highlights collections and categories.
- **`CityIndex.jsx` / `CityDetails.jsx`**:
  - Displays a grid of registered cities. The details page displays location metrics and all experiences in that city.
- **`StateIndex.jsx` / `StateDetails.jsx`**:
  - Outlines available states. The details page shows cities and monuments within that state.
- **`CategoryIndex.jsx` / `CategoryDetails.jsx`**:
  - Displays monument categories (e.g. temples, museums, palaces). The details page displays the list of monuments matching the chosen category.
- **`TrailIndex.jsx` / `TrailDetails.jsx`**:
  - Shows curated tour collections. The details page displays sequentially ordered lists of monuments along with recommended travel paths.
- **`ItineraryIndex.jsx`**:
  - Full trip planner views where users can select multiple attractions to automatically compute visit calendars.
- **`ExploreNearMe.jsx`**:
  - Map UI utilizing HTML5 browser coordinates to display experiences sorted by distance.
- **`TopPlaces.jsx` / `UnescoSites.jsx`**:
  - Curated showcases for top monuments and heritage properties matching UNESCO lists.

### 1.2 Checkout & Transactions
- **`ExperienceDetails.jsx`**:
  - Showcase view of a monument. Features image galleries, operating hours, ticket types, aggregate review stars, a list of user reviews, and the booking configuration form.
- **`BookingPage.jsx`**:
  - Renders forms to select date, time slots, and ticket counts per tier (Adult, Child, Senior). Verifies capacity and requests booking generation.
- **`CheckoutPage.jsx`**:
  - Order summary panel displaying billing addresses and taxes. Prompts users to launch the Razorpay Checkout portal modal.
- **`SuccessPage.jsx`**:
  - Shown post-payment verification. Displays the confirmed booking reference, order summary, and base64-encoded scannable QR ticket codes.
- **`FailedPage.jsx`**:
  - Displays payment decline alerts and options to retry checkouts.

### 1.3 User Dashboard
- **`UserDashboard.jsx`**:
  - User workspace showing:
    - User profiles.
    - Historical bookings list.
    - Review submission logs.
    - Enterprise controls (billing profiles, member invites).
