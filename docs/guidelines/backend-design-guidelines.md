# Backend Design & Optimization Guidelines - ZeQue

This document details coding conventions, service architectures, transaction management, and query optimization rules for the Django backend codebase.

---

## 1. Architectural Code Layering

To prevent bloated views and models, developers must isolate code layers according to domain responsibilities:

```
┌─────────────────────────────────┐
│           DRF Views             │ (Request parsing, routing, response mapping)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Serializers              │ (Input validation, type parsing)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Service Classes           │ (Business logic, third-party calls, checks)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│         Django Models           │ (Entity schemas, simple status properties)
└─────────────────────────────────┘
```

- **Views**: Handle HTTP responses, throttle checking, and authorization flags. Avoid embedding raw queries or calculations.
- **Serializers**: Validate payload schemas and run input checks.
- **Services (`services.py`)**: Core of the business logic. Any transaction, calculations (e.g. seat allocations), or third-party orchestrations must live in service methods.
- **Models**: Simple schema definitions. Avoid calculations that require querysets inside model methods.

---

## 2. Preventing N+1 Database Queries

$N+1$ query issues occur when a view queries a parent model and then iterates over children, triggering separate SQL database queries for each iteration. This is strictly prohibited.

### Guideline
- Use `.select_related()` for single ForeignKey relationships (e.g. `Experience.city`).
- Use `.prefetch_related()` for multi-value relations or ManyToMany connections (e.g. `Experience.ticket_types`).
- **Example optimization**:
  ```python
  # Bad: Triggers queries for city and category on every iteration in the list
  monuments = Experience.objects.all()

  # Good: Pre-fetches city and category tables in a single SQL query
  monuments = Experience.objects.select_related('city', 'category').all()
  ```

---

## 3. Database Transactions Safety

Multi-table write operations (such as creating a Booking, reserving Inventory, and registering payments) must be wrapped inside a database transaction block:
- **Rule**: Use Django's `transaction.atomic` wrapper:
  ```python
  from django.db import transaction

  with transaction.atomic():
      booking.save()
      inventory.reserved_capacity += tickets
      inventory.save()
  ```
- This ensures that if any check fails during execution (e.g., inventory gets fully booked mid-transaction), the entire transaction is rolled back, preventing half-saved states.

---

## 4. Aggregations & Query Execution

- Never pull records into Python memory to compute loops, sums, averages, or counts.
- **Rule**: Use Django database aggregation functions (`django.db.models.Avg`, `Count`, `Sum`):
  ```python
  # Good: Handled entirely inside the SQL database engine
  stats = reviews.aggregate(avg_rating=Avg('rating'), count=Count('id'))
  ```