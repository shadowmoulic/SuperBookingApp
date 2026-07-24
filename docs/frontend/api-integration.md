# Frontend Modules - API Integration & Axios Client

This document explains the frontend network layer, environment config lookup, state-aware API caching, and automated session renewal.

---

## 1. Network Config (`config.js`)

Before initializing network requests, the client checks environment variables using helper methods in `frontend/src/config.js`:
- **`getApiUrl()`**:
  - Resolves target host URL dynamically.
  - If `VITE_API_URL` is defined in `.env` (e.g. `http://localhost:8000`), it uses that.
  - In production, it defaults to the production endpoint `https://api.zeque.in`.
- **`getFirebaseConfig()`**:
  - Pulls React client API keys for the Firebase SDK: `apiKey`, `authDomain`, `projectId`, `storageBucket`, etc.
- **`logConfig()`**:
  - Diagnostic tool running at startup inside `main.jsx` to log active configurations in development.

---

## 2. Axios Client & Caching Store (`api/api.js`)

API requests route through a single, shared Axios instance:
```javascript
const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Forces browser to send HTTP cookies
});
```

### 2.1 GET Caching Layer
To optimize performance and reduce backend database reads, the client overrides `api.get` with a custom cache manager:
- **`cacheStore`**: A memory `Map` holding key-value pairs of request URLs and response payloads.
- **Expiration Threshold**: Cached pages are valid for **5 minutes**.
- **Cache Bypassing**: API calls containing `/auth/` or explicitly specifying `cache: false` bypass the cache.
- **Auto-Clearing Cache**: A response interceptor monitors actions. If any mutation (`POST`, `PUT`, `DELETE`, `PATCH`) succeeds, the cache is instantly cleared via `clearCache()` to ensure data consistency.

---

## 3. Asynchronous Session Refresh Interceptor

To maintain seamless customer sessions without prompting for password inputs, the client sets a response interceptor to intercept `401 Unauthorized` errors:

```
[API Call Fails (401)]
          │
          ▼ (Check: Is error code 'token_not_valid'?)
     ┌──────────┐
     │   Yes    │
     └────┬─────┘
          │
          ▼ (Call POST /auth/refresh/ to renew cookie)
 ┌──────────────────┐
 │ Refresh Succeeds │
 └────────┬─────────┘
          │
          ▼ (Retry original failed request)
```

- **Checks**: The interceptor intercepts failures and verifies that:
  - The HTTP status code is `401`.
  - The response body indicates `code: "token_not_valid"` (SimpleJWT expired token signature).
  - The failed call was not itself a refresh request.
- **Action**: Initiates `POST /auth/refresh/`. Since the cookies are `HttpOnly`, the browser attaches the refresh token cookie.
- **Retry**: On success, the interceptor re-runs the original request.
