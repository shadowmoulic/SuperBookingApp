# Backend Modules - Booking App

The `booking` app governs the core purchase loop, ticketing status, daily inventory tracking, safety services, and access validation.

---

## 1. Directory Structure

```
backend/booking/
├── admin.py                # Admin register for bookings, tickets, payments, inventory
├── apps.py                 # App configuration
├── migrations/             # Database migration folder
├── models.py               # Booking, Ticket, Payment, Inventory, Schedule, Seat, BulkBookingRequest
├── services.py             # Captcha, Booking Limit, and Ticket Verification Services
├── tests.py
├── throttles.py            # API View request rate limits
└── views.py                # View imports or hooks
```

---

## 2. Model Breakdown

- **`Booking`**: Stores transaction references (`BK-XXXXXXXXXXXX`), customer key, total amount, ticket quantities, and lifecycle states (`pending`, `confirmed`, `cancelled`, `used`).
- **`Ticket`**: Stores entry credentials. Each ticket points to a `Booking` and contains a price, ticket type (Adult, Child, Senior), and a unique cryptographically randomized validation string (`qr_code`).
- **`Payment`**: Connects Razorpay transaction orders to the local booking, tracking status and raw response payloads.
- **`Inventory`**: Manages capacity rules for each experience per date. Uses a unique constraint on `(experience, inventory_date)` to ensure data consistency.
- **`BulkBookingRequest`**: Enterprise requests for ticket quantities exceeding standard customer limits.
- **`Schedule` / `Seat`**: Configures specific time slots, capacities, and seat assignments for guided tours or performance-style experiences.

---

## 3. Services Layout (`services.py`)

To ensure clean decoupling of business logic from Django models, the platform isolates core validation features into service managers:

### 3.1 CaptchaService
Provides standard bot-prevention validation on logins, signups, and booking creations:
- Uses a pluggable provider design: `BaseCaptchaProvider` interface with `verify()`.
- Implements `MockCaptchaProvider` for development testing.
- Static helper `CaptchaService.verify(token, request)` delegates token checks to the active provider.

### 3.2 BookingLimitService
Enforces limit restrictions to maintain site safety and prevent ticket scalping:
- `determine_max_tickets(user_data, experience)`: Resolves maximum purchase limit. Checks if `User_Data` profile is an enterprise member or a standard consumer, and evaluates settings.
- `detect_enterprise_booking(user_data)`: Inspects user role to identify if the action falls under corporate parameters.
- `detect_bulk_booking(quantity, user_data, experience)`: Triggers if the request quantity is larger than the resolved threshold, routing the booking to `BulkBookingRequest` review.
- `check_booking_allowed(quantity, user_data, experience)`: Comprehensive safety check. Throws `ValidationError` if the purchase violates rules.

### 3.3 BookingVerificationService
Handles security clearance rules, checking whether the user profile requires SMS OTP authentication or billing code checks during high-volume periods.

---

## 4. Rate Limiting Overrides (`throttles.py`)

To protect endpoints from DDoS attacks and brute-force attempts, the platform declares custom API throttles extending DRF rate throttles:
- **`LoginRateThrottle` / `SignupRateThrottle`**: Restricts authentication attempt rates for anonymous callers.
- **`OtpRateThrottle`**: Throttle limit on SMS verification requests.
- **`PaymentRateThrottle`**: Throttles payment creation attempts.
- **`BookingRateThrottle` / `BulkBookingRateThrottle`**: Controls ticket checkout triggers.
- **`TicketValidationRateThrottle`**: Controls ticket QR code scanner validation lookups to prevent brute-forcing validation tokens.
