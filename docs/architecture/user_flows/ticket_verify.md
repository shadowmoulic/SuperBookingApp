# Ticket Validation & QR Verification Flow - ZeQue

This document describes how entry tickets are issued, how QR codes are generated, and how gate officials scan and validate visitors at the monument entrance.

---

## 1. Sequence Diagram

```mermaid
sequenceDiagram
    actor Visitor as Visitor at Monument
    actor Staff as Gate Official
    participant FE as Scanner App / Browser
    participant BE as Django API
    database DB as Database

    Visitor->>Staff: Present QR code on mobile screen
    Staff->>FE: Scan QR code / Input ticket token
    FE->>BE: POST /api/tickets/validate/ (payload: qr_code)
    Note over BE: Query Ticket by qr_code & check validity
    BE->>DB: Fetch Ticket and related Booking details
    alt Ticket Invalid / Already Scanned
        BE-->>FE: Return 400 Bad Request ("Already scanned" or "Invalid ticket")
        FE->>Staff: Red Alert: "Access Denied / Used"
    else Ticket Valid
        BE->>DB: Set Ticket.is_used = True, set used_at = now()
        BE-->>FE: Return 200 OK (Details: type, holder, booking reference)
        FE->>Staff: Green Alert: "Access Granted - Adult Tier"
        Staff->>Visitor: Permit entrance
    end
```

---

## 2. QR Code Generation (Backend Side)

When a payment is marked successful, the system creates `Ticket` rows in the database.
- **Unique Identifier**: The system generates a highly secure, non-sequential QR token (random alphanumeric code) to prevent ticket forgery or enumeration attacks.
- **Encoding Base64 Image**:
  - Instead of saving images on disk or an external server, the backend calculates the image on-the-fly when requested by the customer details page.
  - The model method `get_qr_code_image_base64()` uses the Python `qrcode` library to write a PNG image stream into a `BytesIO` buffer, converts it to base64, and returns the URI:
    ```python
    import qrcode
    from io import BytesIO
    import base64

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(self.qr_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"
    ```

---

## 3. Validation Endpoint Logic (`TicketValidationView`)

Gate officials use the validation interface to verify entry tickets:
- **API Target**: POST request to `/api/tickets/validate/` containing `{ "qr_code": "token-string" }`.
- **Validation Pipeline**:
  1. **Existence**: Checks if a ticket matching the `qr_code` exists. If not found, returns `404 Not Found` with message `"Ticket does not exist"`.
  2. **Double Scanning Protection**: Evaluates `Ticket.is_used`. If `True`, returns `400 Bad Request` with message `"Ticket has already been used"` and specifies the exact scanning timestamp (`used_at`).
  3. **Booking Context Check**: Verifies that the associated `Booking` has status `confirmed`. (Cannot scan tickets for cancelled or pending bookings).
  4. **Authorization State Transition**: If validation succeeds:
     - Updates `is_used` to `True`.
     - Logs `used_at` to the current system time.
     - Commits changes to the database.
     - Returns `200 OK` with JSON details including: ticket category (e.g. Adult), holder name, monument name, and booking reference.
