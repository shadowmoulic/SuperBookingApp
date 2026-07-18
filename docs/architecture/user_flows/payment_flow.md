# Payment Integration Flow - Razorpay

This document details the payment gateway integration, order creation, frontend verification logic, and asynchronous webhook handling.

---

## 1. Setup & Client Initialization

Razorpay payments are orchestrated through the helper module `backend/api/razorpay_client.py`.
The client is initialized using environment variables:
```python
import razorpay
from django.conf import settings

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)
```

---

## 2. Payment Lifecycle

```
┌──────────────┐
│ Pending Order│ (User selects book now)
└──────┬───────┘
       │
       ▼ (Client calls /api/payments/create/)
┌──────────────┐
│ Razorpay Order│ (Backend calls client.order.create)
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       ▼ (Frontend Verification Succeeds)▼ (Fallback Webhook Triggers)
┌──────────────┐                  ┌──────────────┐
│ Success State│                  │ Success State│
└──────────────┘                  └──────────────┘
```

---

## 3. Detailed Step-by-Step Flow

### Step 1: Create Order (`CreatePaymentView`)
- After creating a `pending` booking, the frontend calls `/api/payments/create/` with the booking reference.
- The backend fetches the booking total amount, converts it to **paise** (e.g., $₹50.00 \to 5000$ paise), and requests an order:
  ```python
  order_data = {
      "amount": int(booking.total_amount * 100),
      "currency": "INR",
      "receipt": booking.reference,
      "payment_capture": 1 # Auto-capture payments
  }
  razorpay_order = client.order.create(data=order_data)
  ```
- A `Payment` object is saved in the database in `pending` status, storing the `razorpay_order["id"]`.
- The backend returns the `key_id`, `amount`, and `order_id` to the frontend.

### Step 2: Open Checkout Modal (Frontend)
- The frontend loads the Razorpay SDK script: `https://checkout.razorpay.com/v1/checkout.js`.
- It opens the overlay with options matching the order payload:
  ```javascript
  const options = {
    key: response.data.key_id,
    amount: response.data.amount,
    currency: "INR",
    name: "ZeQue Booking",
    order_id: response.data.order_id,
    handler: async function (response) {
      // payment succeeded on gateway, verify signature
      await verifyPayment(response);
    },
    theme: { color: "#1B2A4A" } // Heritage Midnight theme accent
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
  ```

### Step 3: Local Verification (`VerifyPaymentView`)
- Upon receiving verification keys from the handler, the client sends a POST request containing:
  - `razorpay_payment_id`
  - `razorpay_order_id`
  - `razorpay_signature`
- The backend checks the HMAC signature locally:
  ```python
  params_dict = {
      'razorpay_order_id': order_id,
      'razorpay_payment_id': payment_id,
      'razorpay_signature': signature
  }
  client.utility.verify_payment_signature(params_dict)
  ```
- If signature check passes:
  - `Payment.status` is set to `success`.
  - `Booking.status` is set to `confirmed`.
  - Tickets are generated.

### Step 4: Webhook Backup (`RazorpayWebhookView`)
- To protect against data loss if a user exits the browser tab before signature verification finishes:
- Razorpay posts webhook requests directly to `/api/payments/webhook/`.
- The backend validates the webhook signature:
  ```python
  webhook_signature = request.headers.get('X-Razorpay-Signature')
  client.utility.verify_webhook_signature(body, webhook_signature, webhook_secret)
  ```
- If valid and payload specifies `payment.captured` or `order.paid`, the system confirms the booking and marks the corresponding database records as successful.
