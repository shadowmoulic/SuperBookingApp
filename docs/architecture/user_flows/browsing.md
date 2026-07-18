# Discovery & Browsing Flow - ZeQue

This document outlines the user flow and search features that enable users to discover monuments, categories, cities, states, and curated trails.

---

## 1. Homepage Entry (Home.jsx)

The user landing experience is designed for fast, visual exploration:
- **Search Bar**: Users can enter a query string. The input matches monument names, cities, and states via the backend `/api/experiences/?search=query` endpoint.
- **Categories Row**: Displays icons (e.g. Forts, Temples, Palaces, Museums). Clicking a category redirects the user to the `/category/:id` route.
- **State & City Indices**: Showcases featured locations. Clicking a city (e.g. Kolkata) takes the user to `/city/:public_id`.
- **Collections Tray**: Features curated trails and itineraries (e.g. "Kolkata British Heritage Trail"). Clicking a collection routes the user to `/trail/:public_id`.

---

## 2. Browsing by Location (City / State Views)

To explore by geography:
- **City Page (`CityDetails.jsx`)**: Displays general info (best time to visit, history), a geographical map showing latitude/longitude (if configured), and a grid of all experiences in that city.
- **State Page (`StateDetails.jsx`)**: Lists all registered cities within the state, accompanied by featured monuments.
- **Filtering Options**: Users can filter listings by Category, open status (`is_open`), and price point directly on the location grids.

---

## 3. "Explore Near Me" (ExploreNearMe.jsx)

This feature detects the user's physical location to suggest close-by monuments:
1. **Permission Request**: The page requests HTML5 geolocation permissions:
   ```javascript
   navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
   ```
2. **Coordinate Handshake**: Once coordinates are acquired, a request is made to:
   ```
   GET /api/experiences/?latitude=XX.XXXXXX&longitude=YY.YYYYYY
   ```
3. **Proximity Calculation**: The backend calculates distance using the Haversine formula on the database coordinates:
   $$\Delta d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
4. **Sorted Display**: The client displays experiences sorted by ascending distance, showing a badge (e.g., "1.4 km away").

---

## 4. Trails & Curated Itineraries

Curated paths allow visitors to easily plan full-day trips:
- **Trail Page (`TrailDetails.jsx`)**: Pulls the `Collection` detail using:
   ```
   GET /api/category/trail/:public_id  (or /api/home/)
   ```
- Displays experiences ordered sequentially by `CollectionExperience.display_order`.
- A route itinerary layout shows the recommended arrival order, travel times, and entry prices for the entire collection in a single timeline view.
