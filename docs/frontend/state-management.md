# Frontend Modules - Client-Side State Management

This document defines state synchronization rules, hooks usage guidelines, and persistent storage policies for the **ZeQue** frontend.

---

## 1. State Distribution Architecture

ZeQue isolates state layers based on scope to maintain high responsiveness and clean code structures:

```
                  ┌──────────────────────┐
                  │    Local State       │ (useState, input values, toggles)
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Global Context State  │         │ API Network Cache     │
│ (Auth, Theme, Location)│         │ (Map cache Store)     │
└───────────────────────┘         └───────────────────────┘
```

---

## 2. State Scopes

### 2.1 Local State (`useState`)
- **Scope**: Isolated to single components.
- **Examples**: Form inputs, local loading overlays, menu toggle flags, tab selections, dynamic price calculations.
- **Rule**: Do not hoist state to contexts or parents unless multiple sibling components depend on it.

### 2.2 Global Context State (`useContext`)
- **Scope**: Shares state across the entire component tree, preventing prop-drilling.
- **Examples**:
  - `AuthContext`: Active user account details, logged-in status.
  - `LocationContext`: Geolocation coordinates, selected cities.
  - `ThemeContext`: Dark/Light theme flags.
  - `ModalContext`: Open states of common overlays.

### 2.3 Network Cache Store (`api.js`)
- **Scope**: Caches GET responses in memory.
- **Policy**:
  - Bypasses caching on authentication checks and POST/PUT/DELETE requests.
  - Valid for **5 minutes**.
  - Restores active data by purging cached records immediately when any write operations succeed.

---

## 3. Storage Persistence Policy

To maintain states across browser reloads, ZeQue uses standard persistence layers:
1. **Cookies (Session Auth)**:
   - Handled directly by Django (`access_token` and `refresh_token`).
   - Configured as HttpOnly to prevent cross-site scripting (XSS) access.
2. **`localStorage`**:
   - Saves persistent client-side UI configurations.
   - Example: Theme preferences (reads `theme` as `light`/`dark` on app startup).
