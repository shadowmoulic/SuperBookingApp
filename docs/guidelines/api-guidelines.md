# API Guidelines & Design Standards - ZeQue

This document outlines RESTful API design guidelines, data formats, error handling structures, and serialization policies for backend development.

---

## 1. RESTful Design Principles

- **Resource-Oriented URLs**: Endpoints must represent resources in plural forms:
  - Good: `/api/experiences/`, `/api/bookings/`
  - Bad: `/api/getExperiences/`, `/api/createBooking/` (except where executing transaction commands like `/api/booking/create/`).
- **HTTP Method Targets**:
  - `GET`: Read-only. Safe and idempotent. Must not modify database state.
  - `POST`: Create resource instances or initiate processes.
  - `PUT` / `PATCH`: Modify properties. Use `PATCH` for partial edits.
  - `DELETE`: Mark resource as deleted (soft delete).

---

## 2. Standardized Response Format

To ensure consistent integration with Axios, all endpoints must return standardized JSON payloads:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Validation / Client Error (HTTP 400 Bad Request)
```json
{
  "detail": "The requested booking date is invalid.",
  "error": "booking_date_past"
}
```

### Server Error (HTTP 500 Internal Server Error)
```json
{
  "detail": "An internal database error occurred while processing.",
  "error": "database_integrity_error"
}
```

---

## 3. Serialization Guidelines

- **ModelSerializer Inheritance**: Extend `serializers.ModelSerializer` to map database rows.
- **Nested Serialization**:
  - Use nested serializers for detail lookups (e.g. including `State` info inside `CitySerializer`).
  - To prevent huge payload sizes, keep list serialization shallow and use full detail serializing models only for individual retrievals.
- **Explicit Validations**:
  - Implement `validate_<field_name>` method constraints on serializer classes to validate fields before passing them to views.
  - Check physical rules (e.g. `start_date` before `end_date`) inside the serializer's `validate()` block.

---

## 4. Query Optimization & Filtering

- **Indexed Searches**: Always use DRF search filters (`rest_framework.filters.SearchFilter`) on fields configured with database indexes.
- **Limit and Pagination**:
  - List endpoints must enforce pagination using page size overrides to prevent pulling massive record lists into the browser.
  - Default list page size: **20 items**.
- **Pre-fetching**: Views must optimize SQL queries. Wrap queries using `.select_related()` for ForeignKey links and `.prefetch_related()` for ManyToMany relationships.