# System Architecture Overview - ZeQue

This document describes the high-level system architecture, client-server orchestration, and technology stack of **ZeQue**.

---

## 1. High-Level Architecture

ZeQue is built as a modern, decoupled web application where the frontend user interface and backend business API run as independent, containerizable services:

```
                  ┌───────────────────────┐
                  │   User Browser        │
                  └──────────┬────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼ Web Page (HTTPS)                ▼ API Requests (REST)
┌───────────────────────┐         ┌───────────────────────┐
│ React SPA (Vercel)    │         │ Django REST API       │
│                       │         │ (Render Cloud)        │
└───────────────────────┘         └───────────┬───────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                                    ▼ Auth Verification  ▼ Transactions
                           ┌─────────────────┐ ┌─────────────────┐
                           │ Firebase Admin  │ │ PostgreSQL /    │
                           │ SDK             │ │ SQLite          │
                           └─────────────────┘ └─────────────────┘
```

- **Frontend Client (Single Page Application)**: Built with React, Vite, and Tailwind CSS. Deployed on Vercel. Communicates with the API server asynchronously using Axios.
- **Backend API Server (REST API)**: Built with Django and Django REST Framework (DRF). Deployed on Render. Handles business logic, database queries, payment verification, and ticket validation.
- **Authentication Gateway**: Firebase Authentication Client SDK captures login credentials (Google Auth, Email/Password, or Phone OTP) and exchanges them for a Firebase ID token. The backend verifies this token via the Firebase Admin SDK to instantiate/retrieve local Django user sessions.
- **Database Layer**: SQLite is used for local development. PostgreSQL is utilized for staging and production environments, managed dynamically via connection string environment variables.
- **Static Assets Service**: Managed through Django's `WhiteNoise` middleware, allowing Gunicorn to serve static assets efficiently without requiring separate CDN assets or storage buckets (e.g., AWS S3).

---

## 2. Core Tech Stack Reference

### Backend
- **Framework**: Django 4.2+ (MTV architecture, but utilized strictly for the Model-Controller-View API layer).
- **REST Engine**: Django REST Framework (DRF) for serialization, views, custom routing, and HTTP response rendering.
- **Session Tokens**: SimpleJWT for JWT token generation and validation.
- **Database Adapter**: `dj-database-url` for parsing relational database configurations dynamically in production environments.
- **Error Tracking**: Optional Sentry integration for real-time crash reporting.

### Frontend
- **Framework**: React 18+ (utilizing Functional Components, custom hooks, and React Context).
- **Build Tool**: Vite (configured for rapid HMR in development and tree-shaken static bundles in production).
- **Styling**: Tailwind CSS for responsive components, leveraging mobile-first utility classes, custom color schemes, and transitions.
- **API Orchestration**: Axios client instance configured with custom base URLs, timeout policies, cookie handling (`withCredentials: true`), and interceptors.

---

## 3. Configuration & Multi-Environment Setup

The backend settings have been modularized to support different environment requirements:
- **`backend/backend/settings/base.py`**: Common settings such as app lists, middleware pipelines, templates, password validators, and internationalization. Also initializes the Firebase Admin SDK using credentials loaded via `FIREBASE_CREDENTIALS_PATH`.
- **`backend/backend/settings/dev.py`**: Optimizations for local development. Enables SQLite (`db.sqlite3`), sets `DEBUG = True`, and relaxes CORS settings to allow local frontend origins (`http://localhost:5173`).
- **`backend/backend/settings/prod.py`**: Hardened production security settings. Configures PostgreSQL (via `DATABASE_URL`), sets `DEBUG = False`, restricts `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to target domains, enables HSTS, configures secure cookies, and forces HTTPS redirection.

The loader in `backend/backend/settings/__init__.py` automatically evaluates the `ENVIRONMENT` or `DJANGO_SETTINGS_MODULE` environment variables to select the correct configuration profile at startup.