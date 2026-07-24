# Backend Modules - Core API App

The `api` application serves as the main gateway and routing coordinator of the backend REST service. It defines views, serializers, SEO tools, and third-party API configurations.

---

## 1. Directory Structure & Key Files

```
backend/api/
├── admin.py                # Admin site configuration
├── apps.py                 # App configuration (name = "api")
├── models.py               # Placeholder (models defined in booking, content, user)
├── paginations.py          # DRF pagination overrides
├── razorpay_client.py      # Razorpay client initializer
├── seo_views.py            # Dynamic XML Sitemap and LLMs context text generators
├── serializers.py          # Catalog, booking, ticket, and user serializers
├── urls.py                 # Core routing registry
└── views.py                # API controllers and request handlers
```

---

## 2. API Endpoints Map

The endpoints are declared in `backend/api/urls.py` and map to views defined in `backend/api/views.py` and `backend/api/seo_views.py`:

### SEO & Public Context API
- `/sitemap.xml` (GET): Dynamic SEO XML sitemap listing active experiences, cities, and states.
- `/llms.txt` (GET): Machine-readable text payload outlining site routes and catalog meta for AI scrapers/agents.

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
- `/api/booking/create/` (POST): Initiates a pending booking with item breakdown and locks inventory.
- `/api/booking/<str:reference>` (GET): Retrieve status and items for a single booking reference.
- `/api/payments/create/` (POST): Initiates Razorpay payment orders.
- `/api/payments/verify/` (POST): Validates payment signatures and confirms bookings.
- `/api/payments/webhook/` (POST): Gateway callback listener for asynchronous payment updates.
- `/api/bookings/` (GET): Returns all confirmed/historical passes of the authenticated user (serialized via `TicketSerializer`).

### Reviews & Ratings API
- `/api/experience/<str:experience_public_id>/reviews/` (GET): Fetch paginated reviews list.
- `/api/reviews/create` (POST): Save a new monument review.
- `/api/reviews/retrieve` (POST): Retrieve user review for an experience.
- `/api/reviews/update` (POST): Edit an existing review.
- `/api/reviews/delete` (POST): Remove a review.

### Enterprise, OTP & Ticket Validation API
- `/api/enterprises/` (GET): List active enterprise profiles.
- `/api/enterprises/register/` (POST): Register new enterprise organization.
- `/api/enterprises/members/` (POST): Invite/manage enterprise account members.
- `/api/bulk-bookings/` (GET/POST): Submit or retrieve bulk booking requests.
- `/api/tickets/validate/` (POST): Validates scanned ticket QR codes at monument gates.
- `/api/otp/request/` (POST): Dispatch SMS OTP tokens for mobile authentication.

### Official Portal API
- `/api/official-portal/` (GET): Validates access role of gate staff and portal admins.
- `/api/official/logout/` (POST): Logout session for official staff.
- `/api/official/meta/` (GET): Portal statistics (revenue, total checks, counts).
- `/api/official/upload-csv/` (POST): Process bulk uploaded catalog data sheets.
- `/api/official/experiences/` (GET/POST/PUT) & `<int:pk>/`: Manage experiences catalog.
- `/api/official/cities/` (GET/POST/PUT): Administrative city management.
- `/api/official/states/` (GET/POST/PUT): Administrative state management.
- `/api/official/categories/` (GET/POST/PUT): Administrative category management.
