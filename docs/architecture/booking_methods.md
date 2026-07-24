# Booking Logic & Capacity Check Methods - ZeQue

This document explains the booking lifecycle, ticket pricing logic, inventory capacity constraints, multi-item breakdown structure, and transaction processing patterns.

---

## 1. Booking Status Transitions

Every booking in ZeQue progresses through a well-defined lifecycle represented by the `Booking.status` field:

```
           [User Initiates Booking]
                      │
                      ▼
                 ┌───────────┐
                 │  Pending  │ (Locks inventory capacity for items)
                 └─────┬─────┘
                       │
             ┌─────────┴─────────┐ (Payment Verified)
             │                   │
             ▼                   ▼
      ┌───────────┐        ┌───────────┐
      │ Cancelled │        │ Confirmed │ (Generates QR codes / Tickets per item)
      └───────────┘        └─────┬─────┘
                                 │
                                 ▼ (Scanned at Entry Gate)
                           ┌───────────┐
                           │   Used    │
                           └───────────┘
```

- **`pending`**: Initial state. Triggered via `CreateBookingView` when a user selects an experience, time slot, and ticket quantities across one or more ticket item categories. At this point, the system increments `reserved_count` and locks capacity in the `Inventory` table to prevent double bookings.
- **`confirmed`**: Set automatically by `VerifyPaymentView` once the Razorpay transaction payload is successfully verified. This phase triggers `BookingItem` finalization and generates unique `Ticket` entries (with QR code images) for each item.
- **`cancelled`**: Set if the user manually cancels their booking (eligible for refund depending on `BookingPolicy`) or if the reservation cleanup task cancels a `pending` booking that has expired unpaid (releasing capacity).
- **`used`**: Set when the ticket's QR code is successfully scanned and verified at the monument entrance via `TicketValidationView`.

---

## 2. Multi-Item Booking Architecture & Ticket Serialization

A single `Booking` reservation can contain multiple line items (`BookingItem` instances), allowing visitors to purchase tickets for different categories (e.g. 2 Adult Foreigners + 1 Child Indian) in a single checkout transaction:

### 2.1 Entity Relationship
- **`Booking`**: Parent transaction record storing `reference`, `experience`, `booking_date`, `total_tickets`, `total_amount`, and `status`.
- **`BookingItem`**: Individual item line storing `ticket_type`, `time_slot`, `quantity`, `unit_price`, `subtotal`, `nationality_category` (e.g. "Indian", "Foreigner"), and `age_category` (e.g. "Adult", "Child", "Senior").
- **`Ticket`**: Physical/digital ticket pass linked to a `BookingItem`, storing unique `qr_code`, Base64 `qr_image`, `price`, `is_used`, and `used_at`.

### 2.2 TicketSerializer Data Payload
When authenticated users fetch passes via `/api/bookings/`, `TicketSerializer` outputs a complete, flat-structured ticket pass:
- `qr_code` (unique QR identifier string)
- `qr_image` (Base64 PNG string ready for image tags)
- `booking_reference`, `booking_date`
- `ticket_type_name` (e.g. "General Entry")
- `age_category` (e.g. "Adult"), `nationality_category` (e.g. "Indian")
- `time_slot` (formatted operating schedule range, e.g. "09:00 - 12:00")
- `quantity`, `price`
- `is_used`, `used_at`, `status`
- `experience_id`, `experience_name`, `experience_image`

---

## 3. Capacity & Inventory Checks

To manage attendance limits, ZeQue implements an index-optimized inventory tracking model:

### Step 1: Pre-booking Verification
When checking availability for `(experience, booking_date)`, the system queries the `Inventory` table for each requested item schedule.
If no inventory record exists for that date, one is dynamically initialized:
- `capacity` is set to the experience's or schedule's maximum capacity.
- `available_capacity` is derived from `capacity - (reserved_count + confirmed_count + blocked_count)`.

### Step 2: Capacity Allocation
Before saving a booking, the system verifies:
$$\text{available\_capacity} \ge \sum \text{requested\_item\_quantities}$$
If true, the booking transaction proceeds:
- `reserved_count` is increased by the requested ticket quantity.
- The inventory row is saved within an atomic database transaction.

### Step 3: Resolution or Release
- **Upon success** (`confirmed`): The `reserved_count` converts to `confirmed_count`.
- **Upon entry check-in** (`used`): The `confirmed_count` converts to `used_count`.
- **Upon failure/cancellation**: The system decrements `reserved_count` (or `confirmed_count`) and increments `cancelled_count`.

---

## 4. Dynamic Pricing & Category Resolution

The price of each `BookingItem` line is computed using the active pricing rule, age/nationality category choices, and valid seasonal adjustments:

$$\text{Item Unit Price} = \text{Base Category Price} \times \text{Seasonal Multiplier}$$
$$\text{Booking Total Amount} = \sum (\text{Item Unit Price} \times \text{Quantity})$$

1. The customer selects a `TicketType` along with nationality (`Indian`/`Foreigner`/`SAARC`) and age (`Adult`/`Child`/`Student`/`Senior`) categories.
2. The system locates the active `PricingRule` for that `TicketType` where `valid_from <= booking_date <= valid_to` matching the selected categories.
3. If a seasonal multiplier is active (e.g., `1.5` during peak holiday periods), it scales the base rate.
4. If no specific `PricingRule` is matched, the system falls back to `entry_fee_base`.
5. The sum of all `BookingItem.subtotal` values is stored in `Booking.total_amount` and passed to Razorpay for order creation.

---

## 5. ONDC Catalog Compatibility

Our booking logic aligns with the ONDC (Open Network for Digital Commerce) standard schemas:
- **Seller-Side Inventory API**: Because availability is separated into the high-performance `Inventory` table, the platform can serve fast, concurrent queries for ONDC's `select` payload without calculating previous orders in real-time.
- **Merchant/Provider Split**: Experiences are linked to a `Provider` (merchant of record), which maps to ONDC's multi-provider marketplace structure under a single distributor/seller app.