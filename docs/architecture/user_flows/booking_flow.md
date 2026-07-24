# Customer Ticket Booking Flow - ZeQue

This document walks through the step-by-step user experience and backend transaction sequence during a standard monument ticket booking.

---

## 1. Sequence Diagram

```mermaid
sequenceDiagram
    actor User as Customer (Browser)
    participant FE as React Frontend
    participant BE as Django API
    participant RP as Razorpay SDK/API
    database DB as Database

    User->>FE: Select Date, Slot, and Ticket Types
    FE->>BE: POST /api/booking/create/ (payload)
    Note over BE: Validate inputs & check available inventory capacity
    BE->>DB: Lock Inventory Capacity (Pending state)
    BE-->>FE: Return Pending Booking & total_amount
    FE->>BE: POST /api/payments/create/ (booking_id)
    BE->>RP: Create Order (amount, currency)
    RP-->>BE: Order ID (order_XXXX)
    BE-->>FE: Return Razorpay Options (Order ID, Key)
    FE->>User: Display Razorpay Checkout Modal
    User->>RP: Input Card/UPI & Submit Payment
    RP-->>FE: Return Payment IDs & Signature
    FE->>BE: POST /api/payments/verify/ (IDs & Signature)
    BE->>RP: Verify Signature locally
    alt Signature Valid
        BE->>DB: Update Booking to Confirmed & Generate Tickets/QRs
        BE-->>FE: Return Success Response
        FE->>User: Display Success Screen with Tickets & QR codes
    else Signature Invalid
        BE->>DB: Mark Payment Failed
        BE-->>FE: Return Error Response
        FE->>User: Display Payment Failed Screen
    end
```

---

## 2. Phase-by-Phase Description

### Phase 1: Customizing Tickets & Schedule
- The user visits the **Experience Detail** page.
- Using the booking widget, they select a date (only dates with active schedules or within seasonal operating boundaries are allowed) and optional slot time.
- They configure the number of tickets per type (e.g. 2 x Adult, 1 x Child).

### Phase 2: Booking Initialization
- Clicking "Book Now" sends a POST request to `/api/booking/create/`.
- If the visitor is unauthenticated, the frontend intercepts this action, blocks the request, and displays the **LoginSignup** modal.
- The backend validates that:
  - The date is in the future.
  - The quantity is greater than 0.
  - The monument is open on the requested day.
  - Inventory exists and has sufficient capacity.
- The backend initializes a `Booking` row with status `pending`, generates a reference ID (e.g., `BK-9C4EFA72B2`), and reserves the inventory capacity.

### Phase 3: Payment Orchestration
- The frontend sends the booking reference to `/api/payments/create/`.
- The backend generates a Razorpay Order through the SDK using `total_amount` and registers a `Payment` object in the database with status `pending`.
- The client receives the order details and invokes the `Razorpay` modal overlay.

### Phase 4: Payment Verification & Ticketing
- If the payment succeeds, the gateway returns `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
- The frontend sends these to `/api/payments/verify/` using an Axios POST request.
- The backend uses the Razorpay API credentials to verify the cryptographic signature:
  - **Success**: The `Booking` transitions to `confirmed`. `Ticket` records are created for each of the requested items (e.g., Adult, Child). Each ticket receives a unique cryptographically randomized string as a `qr_code` field.
  - **Failure**: The transaction is marked failed, and the inventory capacity is released.
- The user is redirected to `/booking/success/` or `/booking/failed/` based on the API response.
