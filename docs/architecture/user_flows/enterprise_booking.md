# Enterprise & Bulk booking Flow - ZeQue

This document describes the organization onboarding process, member domain authorization, and bulk booking approvals.

---

## 1. Enterprise Onboarding & Domain Control

Organizations or educational institutions can register for corporate accounts to book group tickets or manage team visits.

### Onboarding Flow
1. **Registration**: An organization admin registers details through the `/api/enterprises/register/` endpoint, specifying:
   - Enterprise Name (e.g., "Google India")
   - Corporate Website
   - Email Domain (e.g., `google.com`)
   - Billing & Tax Address
2. **Profile Generation**: The backend inserts an `Enterprise` record and generates a unique `public_id`.
3. **Primary Admin Link**: The registering user profile (`User_Data.role`) is set to `enterprise_admin` and linked to the enterprise in the `EnterpriseMember` table.

### Member Invitation
- Enterprise admins invite members using `/api/enterprises/members/`.
- **Auto-Join Domain Authorization**: If a user signs up with an email address matching the enterprise's registered domain (e.g., `john.doe@google.com`), they are automatically recognized and can choose to link their profile to the Enterprise workspace as a `member`.

---

## 2. Bulk & Group Ticket Requests

Standard consumer checkouts limit individual bookings to a maximum threshold (e.g., 10 tickets per order) to prevent ticket scalping. Groups exceeding this limit must use the Bulk Booking workflow:

```
[Member Submits Bulk Request]
              │
              ▼ (Exceeds consumer threshold)
   ┌──────────────────────┐
   │ Pending Review State │ (Logged in BulkBookingRequest table)
   └──────────┬───────────┘
              │
      ┌───────┴───────┐ (Official Portal Approval)
      ▼               ▼
 ┌──────────┐    ┌──────────┐
 │ Approved │    │ Rejected │
 └────┬─────┘    └──────────┘
      │
      ▼
[Sends invoice link for Razorpay payment]
      │
      ▼ (Payment Confirmed)
[Tickets generated & emailed to admin]
```

### Process Lifecycle
1. **Request Submission**: An enterprise member submits a bulk booking query containing the date, monument, ticket counts, and justification.
2. **Limit Validation**: The backend `BookingLimitService` intercepts the request, notes it is above the consumer threshold, and inserts a `BulkBookingRequest` with a status of `pending_review`.
3. **Portal Review**: Officials log into the **Official Portal** and inspect the request list. They can approve or deny the request based on daily site capacity.
4. **Checkout Trigger**: Upon approval, the status changes to `approved` and the enterprise admin receives a payment invoice link.
5. **Ticketing**: Once paid, a standard transaction completes and a single master booking receipt with bulk ticket files is issued.
