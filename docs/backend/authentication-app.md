# Backend Modules - Authentication App

The `authentication` app manages identity management, JWT token issue pipelines, session verification, and Firebase credential checks.

---

## 1. Directory Structure

```
backend/authentication/
├── admin.py
├── apps.py
├── authentication.py       # Custom JWT cookie authentication policy
├── models.py               # Placeholder (profile is in user app)
├── supabase_auth.py       # Supabase utility functions
├── urls.py                 # Auth paths
└── views.py                # Login, signup, refresh, and logout controllers
```

---

## 2. Authentication Flow

ZeQue implements a hybrid authentication mechanism. The frontend uses the Firebase Web SDK for credentials check, while the backend generates standard Django sessions via secure, HTTP-only cookies:

```
[Customer Client (React)]              [Auth API Views]           [Firebase Admin SDK]
           │                                   │                           │
           │── 1. Enter Credentials ──────────>│                           │
           │   (Email/Google/Phone)            │                           │
           │                                   │                           │
           │── 2. Get Firebase Token ─────────>│                           │
           │                                   │                           │
           │── 3. POST /auth/login/ ──────────>│                           │
           │   (with firebase_token)           │                           │
           │                                   │── 4. Verify ID Token ────>│
           │                                   │<── 5. Token verified ─────│
           │                                   │
           │                                   │── 6. Get/Create User &
           │                                   │      profile in database
           │                                   │
           │                                   │── 7. Generate access &
           │                                   │      refresh SimpleJWTs
           │                                   │
           │<── 8. Return response cookie ─────│
           │   (HttpOnly, Secure, SameSite)    │
```

---

## 3. Class and View Documentation

### 3.1 Views

#### LoginView (`views.py`)
- **Route**: `POST /auth/login/`
- **Method Actions**:
  - Receives `firebase_token` from the frontend payload.
  - Verifies the signature with `auth.verify_id_token(firebase_token)` via the Firebase Admin SDK.
  - Retrieves email, name, and phone details from the payload.
  - Finds or inserts a matching Django `User` record.
  - Verifies that a matching `User_Data` profile exists (creates one with role `customer` if missing).
  - Generates SimpleJWT tokens (`access` and `refresh`).
  - Sets cookies on the HTTP response:
    - **`access_token`**: Expires in 30 minutes. Configured as `HttpOnly`, `SameSite="Lax"`, `Secure` (in production).
    - **`refresh_token`**: Expires in 1 day. Configured as `HttpOnly`, `SameSite="Lax"`, `Secure` (in production).
  - Also supports fallback standard Django credential logins (`username` and `password`).

#### RegisterView (`views.py`)
- **Route**: `POST /auth/register/`
- Handles registration and user creation. Creates the user profile and returns standard JWT cookie tokens.

#### RefreshView (`views.py`)
- **Route**: `POST /auth/refresh/`
- Reads the `refresh_token` cookie, requests SimpleJWT to issue a fresh access token, and sets the updated `access_token` cookie on the client response.

#### LogoutView (`views.py`)
- **Route**: `POST /auth/logout/`
- Deletes the `access_token` and `refresh_token` cookies by setting their values to empty and setting their expiration dates to the past.

---

### 3.2 Security Authenticator (`authentication.py`)

A custom Django Rest Framework authentication class detects and processes sessions on secure requests:
- **`CookieJWTAuthentication`**:
  - Extends simple JWT authentication handler classes.
  - Intercepts requests, reads the `access_token` from request cookies rather than the standard `Authorization: Bearer <token>` header.
  - Decodes and verifies the token.
  - Automatically loads `request.user` with the authorized Django user object.
