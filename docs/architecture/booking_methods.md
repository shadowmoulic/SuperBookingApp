# Booking Logic & Capacity Check Methods - ZeQue

This document explains the booking lifecycle, ticket pricing logic, inventory capacity constraints, and transaction processing patterns.

---

## 1. Booking Status Transitions

Every booking in ZeQue progresses through a well-defined lifecycle represented by the `Booking.status` field:

```
           [User Initiates Booking]
                      │
                      ▼
                 ┌───────────┐
                 │  Pending  │ (Locks inventory capacity)
                 └─────┬─────┘
                       │
             ┌─────────┴─────────┐ (Payment Verified)
             │                   │
             ▼                   ▼
      ┌───────────┐        ┌───────────┐
      │ Cancelled │        │ Confirmed │ (Generates QR codes/tickets)
      └───────────┘        └─────┬─────┘
                                 │
                                 ▼ (Scanned at Entry Gate)
                           ┌───────────┐
                           │   Used    │
                           └───────────┘
```

- **`pending`**: Initial state. Triggered via `CreateBookingView` when a user selects an experience, slot, and ticket quantity. At this point, the system increments `reserved_capacity` and decrements `available_capacity` in the `Inventory` table to prevent double bookings.
- **`confirmed`**: Set automatically by `VerifyPaymentView` once the Razorpay transaction payload is successfully verified. This phase triggers the generation of unique QR codes for each ticket.
- **`cancelled`**: Set if the user manually cancels their booking (eligible for refund depending on `BookingPolicy`) or if the reservation cleanup task cancels a `pending` booking that has expired unpaid (releasing capacity).
- **`used`**: Set when the ticket's QR code is successfully scanned and verified at the monument entrance.

---

## 2. Capacity & Inventory Checks

To manage attendance limits, ZeQue implements an index-optimized inventory tracking model:

### Step 1: Pre-booking Verification
When checking availability for `(experience, booking_date)`, the system queries the `Inventory` table.
If no inventory record exists for that date, one is dynamically initialized:
- `total_capacity` is set to the experience's `max_daily_capacity`.
- `available_capacity` is set to `max_daily_capacity`.
- `reserved_capacity` is set to `0`.

### Step 2: Capacity Allocation
Before saving a booking, the system verifies:
$$\text{available\_capacity} \ge \text{requested\_tickets}$$
If true, the booking transaction proceeds:
- `reserved_capacity` is increased by the requested tickets.
- `available_capacity` is decreased by the requested tickets.
- The inventory row is saved.

### Step 3: Resolution or Release
- **Upon success** (`confirmed`): The `reserved_capacity` remains locked as part of the booking, and when checked-in, status changes to used.
- **Upon failure/cancellation**: The system adds the ticket count back to `available_capacity` and decrements `reserved_capacity`.

---

## 3. Dynamic Pricing Resolution

The price of a ticket is computed using the active pricing tier and valid seasonal adjustments:

$$\text{Final Ticket Price} = \text{Base Price} \times \text{Seasonal Multiplier}$$

1. The customer selects a `TicketType` (e.g., Student, Foreigner).
2. The system locates the active `PricingRule` for that `TicketType` where `valid_from <= booking_date <= valid_to`.
3. If a seasonal multiplier is active (e.g., `1.5` during holiday periods), it scales the base rate.
4. If no specific `PricingRule` is matched, the system falls back to the experience's `entry_fee_base`.
5. The sum of all selected ticket prices is stored in `Booking.total_amount` and sent to the Razorpay Order API.

---

## 4. ONDC Catalog Compatibility

Our booking logic aligns with the ONDC (Open Network for Digital Commerce) standard schemas:
- **Seller-Side Inventory API**: Because availability is separated into the high-performance `Inventory` table, the platform can serve fast, concurrent queries for ONDC's `select` payload without calculating previous orders in real-time.
- **Merchant/Provider Split**: Experiences are linked to a `Provider` (merchant of record), which maps to ONDC's multi-provider marketplace structure under a single distributor/seller app.