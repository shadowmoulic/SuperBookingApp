# Frontend Modules - React Components

This document details the reusable UI components, navigation shells, auth dialogs, and loaders that build the **ZeQue** user interface.

---

## 1. Primary Components Overview

### 1.1 Navigation Shells
- **`Navbar.jsx`**:
  - Sticky navigation bar (`fixed top-0 w-full z-50`).
  - Implements dynamic styling adjustments on scroll.
  - Links to search, locations, and the official portal.
  - Controls authentication triggers (opens `LoginSignup` modal or handles logout actions).
- **`Footer.jsx`**:
  - A semantic, responsive footer component.
  - Contains descriptive logo brand boxes, category lists, help desks, legal conditions, and localized copyright notices.
  - Displays transparent social icons with transition hover effects.

### 1.2 Access & Authentication
- **`LoginSignup.jsx`**:
  - Combined sliding dialog modal.
  - Integrates Firebase SDK authentication logic.
  - Features three input configurations: Email/Password, Google OAuth, and Phone SMS OTP.
  - Enforces backend token refresh using `getIdToken(true)` upon successful verification.
- **`ProtectedRoute.jsx`**:
  - Route guard container wrapper.
  - Inspects user login states. If unauthenticated, blocks routing, caches the redirection path, and triggers the login dialog overlay.

### 1.3 Catalog Displays
- **`ExperienceCard.jsx`**:
  - Grid card presenting monuments, showcasing:
    - High-quality cover photo.
    - Title name, category badge, and location city.
    - Proximity metrics (if location filters are active).
    - Aggregate rating stars.
- **`LocationCard.jsx` / `LocationBentoCard.jsx`**:
  - Visual layout structures for cities and states, matching a Bento grid design with hovering image expansions.
- **`TrailCard.jsx`**:
  - Shows curated tour collections, paths, and attraction sequences.
- **`BookingCard.jsx`**:
  - Dashboard component showing ticket purchases: reference code, booking status badges (`pending`, `confirmed`), total ticket count, and cancellation buttons.

### 1.4 Interactive Helpers
- **`Chatbot.jsx`**:
  - Floating dialogue widget allowing users to ask booking FAQs or receive trail recommendations.

### 1.5 Loading & Skeleton Screens
- **`Loading.jsx`**:
  - Modern full-page ticket loading spinner.
- **`SkeletonLoaders.jsx`**:
  - CSS-animated shimmer panels displaying layout skeletons during data fetches, preventing layout shifting.
