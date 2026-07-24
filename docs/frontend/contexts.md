# Frontend Modules - React Contexts

This document details the React Contexts used to maintain global state, user sessions, theme configurations, modals visibility, and geolocation services across the **ZeQue** client.

---

## 1. Contexts Breakdown

### 1.1 AuthContext (`AuthContext.jsx`)
Coordinates user sessions and acts as the gatekeeper for login profiles:
- **State Fields**:
  - `user`: Holds the parsed response payload from the `/auth/me/` endpoint (username, email, roles, etc.) or `null` if unauthenticated.
  - `isAuthenticated`: Boolean helper evaluated as `!!user`.
  - `loading`: Boolean state indicating whether the initial startup authentication check is in progress.
- **Methods**:
  - `checkUserStatus()`: Asynchronously checks `/auth/me/` to verify session cookies on app startup.
  - `loginWithFirebaseToken(firebaseToken)`: Posts the verified Firebase ID Token to `/auth/login/` to initialize backend session cookies.
  - `logout()`: Clears session cookies by posting to `/auth/logout/` and resets the local `user` state.
  - `updateProfile(profileData)`: Patches `/auth/me/` to save modifications.

### 1.2 LocationContext (`LocationContext.jsx`)
Manages visitor coordinates to enable geo-aware searching:
- **State Fields**:
  - `selectedCity`: The city name the user selected to browse manually.
  - `userCoords`: Holds `{ latitude, longitude }` computed from the HTML5 geolocation sensor.
  - `geoEnabled`: Tracks permission grants.
- **Methods**:
  - `requestGeoPermission()`: Triggers the browser location prompt, reads coordinates, and updates global states to trigger proximity sorting.

### 1.3 ModalContext (`ModalContext.jsx`)
Ensures overlay triggers are managed centrally:
- **State Fields**:
  - `isAuthModalOpen`: Triggers the sliding login/signup dialog.
  - `isChatbotOpen`: Controls the visibility of the floating FAQ helper.
  - `activeRedirectionPath`: Caches target route strings when a ProtectedRoute blocks navigation, allowing redirection to resume post-login.

### 1.4 ThemeContext (`ThemeContext.jsx`)
Controls design modes and themes:
- **State Fields**:
  - `theme`: `light` or `dark` setting.
- **Action**: Writes selections to `localStorage` and appends/removes the `.dark` class on the root HTML tag to toggle Tailwind dark mode.
