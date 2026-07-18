# Backend Modules - Core API App

The `api` application serves as the main gateway and routing coordinator of the backend REST service. It defines views, serializers, and third-party API configurations.

---

## 1. Directory Structure & Key Files

```
backend/api/
├── admin.py                # Admin site configuration
├── apps.py                 # App configuration (name = "api")
├── models.py               # Placeholder (models are defined in booking, content, user)
├── paginations.py          # DRF pagination overrides
├── razorpay_client.py      # Razorpay client initializer
├── serializers.py          # Catalog, booking, and user serializing classes (30,000+ lines of serialization rules)
├── urls.py                 # Core routing registry
└── views.py                # API controllers (70,000+ lines of view logic)
```

---

## 2. API Endpoints Map

The endpoints are declared in `backend/api/urls.py` and map to views defined in `backend/api/views.py`:

### Public Discovery API
- `/api/experiences/` (GET): Retrieve list of experiences with filters (state, city, category, open status). Supports search parameters and distance sorting (via lat/lng).
- `/api/experience/<str:public_id>` (GET): Detailed experience catalog data.
- `/api/cities/` (GET): Retrieve list of cities.
- `/api/cities/names/` (GET): Retrieve list of cities name labels only.
- `/api/city/<str:public_id>` (GET): Details of a single city.
- `/api/states/` (GET): List of all states.
- `/api/state/<str:public_id>` (GET): Details of a single state.
- `/api/category/<str:id>` (GET): Details of a single category and related experiences.
- `/api/home/` (GET): Returns homepage highlights, landing slides, and collections.

### Transactions & Bookings API
- `/api/booking/create/` (POST): Initiates a pending booking and locks inventory.
- `/api/booking/<str:reference>` (GET): Retrieve status of a booking.
- `/api/payments/create/` (POST): Initiates Razorpay payment orders.
- `/api/payments/verify/` (POST): Validates the payment signature locally.
- `/api/payments/webhook/` (POST): Gateway callback listener for payment statuses.
- `/api/bookings/` (GET): List all historical bookings of the authenticated user.

### Reviews & Ratings API
- `/api/experience/<str:experience_public_id>/reviews/` (GET): Fetch paginated reviews list.
- `/api/reviews/create` (POST): Save a new monument review.
- `/api/reviews/update` / `/api/reviews/delete` (POST): Edit or delete reviews.

### Administrative & Official Portal API
- `/api/official-portal/` (GET): Validates access role of gate staff and portal admins.
- `/api/official/upload-csv/` (POST): Process uploaded data sheets.
- `/api/official/meta/` (GET): Portal statistics (revenue, total checks, counts).
- `/api/official/experiences/` (GET/POST/PUT): CRUD experiences in the database.
- `/api/tickets/validate/` (POST): Verifies scanned QR code tokens at monument gates.
