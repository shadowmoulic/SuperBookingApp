# ZeQue - Modern Monument & Heritage Experience Booking Platform

Welcome to **ZeQue**, a modern full-stack web application designed for booking tickets, curated trails, and guided experiences for historical monuments and heritage sites. The system is built for high performance, mobile responsiveness, secure authentication, and marketplace compliance (ready for future ONDC integrations).

---

## 🏗️ Architecture & Technology Stack

The application is structured as a decoupled Single Page Application (SPA) communicating with a RESTful backend API:

```
┌─────────────────────────────────┐
│        React Frontend           │ (Vite, Axios, Tailwind CSS)
└────────────────┬────────────────┘
                 │
                 ▼ API Requests (JWT Auth)
┌─────────────────────────────────┐
│        Django REST API          │ (Django REST Framework)
└────────┬───────┬────────┬───────┘
         │       │        │
         ▼       ▼        ▼
┌────────┴──┐ ┌──┴──────┐ ┌┴────────────────────────┐
│ PostgreSQL│ │ Firebase│ │ Razorpay Payment Gateway│
│ (Database)│ │ (Auth)  │ │ (Payment Verification)  │
└───────────┘ └─────────┘ └─────────────────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, Axios.
- **Backend**: Python 3.11+, Django 4.2+, Django REST Framework (DRF), SimpleJWT.
- **Database**: SQLite (Development) / PostgreSQL deployed on Supabase (Production).
- **Authentication**: Firebase Client SDK + Django Backend Token Verification (via HttpOnly Cookies).
- **Payments**: Razorpay Gateway (API + webhook verification).
- **Production Server**: Gunicorn deployed on Render (backend) and Vercel (frontend).

---

## 📁 Project Directory Structure

```
SuperBookingApp/
├── backend/                  # Django backend application
│   ├── api/                  # Core REST API Views, Serializers, and routing
│   ├── authentication/       # Firebase verification & SimpleJWT token issuer
│   ├── booking/              # Booking, Ticket, Inventory, & Payments models
│   ├── content/              # State, City, Category, Provider, Experience models
│   ├── user/                 # Extended user profile & Enterprise settings
│   ├── reviews/              # User ratings and reviews
│   └── manage.py             # Django management CLI
├── frontend/                 # React frontend application (Vite-based)
│   ├── src/
│   │   ├── api/              # Axios instance and API routes config
│   │   ├── components/       # Reusable components (Header, Footer, modals)
│   │   ├── context/          # React contexts (AuthContext)
│   │   └── pages/            # Page components (Home, Booking, Checkout, etc.)
│   └── package.json          # Node dependencies
└── docs/                     # Detailed project documentation
    ├── architecture/         # System design and database schema
    ├── backend/              # Django apps detailed modules
    ├── frontend/             # React views, components, and contexts
    └── guidelines/           # Coding standards, PR templates, and UI designs
```

---

## 🚀 Quick Setup & Local Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- Firebase Project setup
- Razorpay Sandbox API keys

### 1. Run the Backend
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Set up virtual environment and install packages:
   ```bash
   python -m venv env
   .\env\Scripts\activate
   pip install -r requirements.txt
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` with your database credentials, Firebase config path, and Razorpay API keys.*
4. Run migrations and start server:
   ```bash
   python manage.py migrate --settings=backend.settings.dev
   python manage.py runserver --settings=backend.settings.dev
   ```
   The backend will be running at `http://localhost:8000/`.

### 2. Run the Frontend
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to supply Firebase SDK Client keys.*
4. Start Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173/`.

---

## 📖 Navigable Documentation Index

Click on the links below to browse specific project documentation files:

### 🏛️ System & Design Architecture
* **[System Overview](docs/architecture/system_overview.md)**: Deep dive into tech stack and client-server orchestration.
* **[Database Schema](docs/architecture/database_schema.md)**: Complete database models, types, unique keys, and index fields.
* **[Booking Methods](docs/architecture/booking_methods.md)**: Overview of ticket booking logic, ONDC structure, and capacity tracking.

### 👣 Interactive User Flows
* **[Browsing & Search Flow](docs/architecture/user_flows/browsing.md)**: Monument search, categorization, and trails.
* **[Ticket Booking Flow](docs/architecture/user_flows/booking_flow.md)**: Selecting dates, verifying capacities, and booking creation.
* **[Payment Gateway Flow](docs/architecture/user_flows/payment_flow.md)**: Razorpay checkout popup, server verification, and webhook safety.
* **[Enterprise & Group Booking](docs/architecture/user_flows/enterprise_booking.md)**: Corporate booking and organization invite patterns.
* **[Ticket Gate Verification](docs/architecture/user_flows/ticket_verify.md)**: Scannable QR code generation and validation.
* **[Provider Dashboard](docs/architecture/user_flows/provider_flow.md)**: Management of experiences and operations.

### ⚙️ Backend Module Details
* **[Core API App](docs/backend/api-app.md)**: Routing endpoints, views, and controllers.
* **[Authentication Module](docs/backend/authentication-app.md)**: Firebase integration, login view logic, and JWT settings.
* **[Booking App](docs/backend/booking-app.md)**: Inventory tracking, bookings, payments, and schedules.
* **[Content App](docs/backend/content-app.md)**: Core models for state, city, provider, experience, and pricing.
* **[User & Profile App](docs/backend/user-app.md)**: User profiles, roles, and enterprise settings.

### 🎨 Frontend Module Details
* **[API Integration](docs/frontend/api-integration.md)**: Axios client, interceptors, and environment configurations.
* **[React Components](docs/frontend/components.md)**: Navigation Header, custom Footer, Modals, and forms.
* **[State Management](docs/frontend/state-management.md)**: Global AuthContext and state caching patterns.
* **[Page Routers & Views](docs/frontend/pages.md)**: Detailed page structure, dashboard, and layouts.

### 📐 Coding Guidelines & Standards
* **[Coding Standards](docs/guidelines/coding-standards.md)**: Code formatting, DRY principle, and style criteria.
* **[API Guidelines](docs/guidelines/api-guidelines.md)**: RESTful error responses, endpoints design.
* **[UI & Styling Guidelines](docs/guidelines/UI-guidelines.md)**: Design theme details, heritage midnight color schemes, typography, and animations.
* **[Backend Architecture Guidelines](docs/guidelines/backend-design-guidelines.md)**: Service layer patterns, N+1 query prevention guidelines.
* **[AI Code-Gen Guidelines](docs/guidelines/AI_guidelines.md)**: Instructions for copilot contributions.
* **[PR & Decision Templates](docs/guidelines/pull_requests.md)**: Templates for ADRs ([Decision Template](docs/guidelines/decision-template.md)), RFCs ([RFCs Template](docs/guidelines/rfcs-template.md)), and PR logs.

### 📦 Setup & Operations Documents (Previous Tasks)
* **[Deployment Guide](docs/agent-tasks/docs-copilot/DEPLOYMENT_GUIDE.md)**: Production deployment checklist for Render & Vercel.
* **[Environment Variables](docs/agent-tasks/docs-copilot/ENVIRONMENT_VARIABLES.md)**: Complete configuration settings sheet.
* **[Firebase Auth Fix Details](docs/agent-tasks/docs-copilot/FIREBASE_AUTH_CHANGES.md)**: Deep dive into the authentication fix.
* **[Architectural Decisions on ONDC](docs/agent-tasks/ArchitectureAndONDC.md)**: Details of ONDC marketplace catalog integration.