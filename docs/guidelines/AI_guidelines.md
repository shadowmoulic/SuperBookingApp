# Developer & AI Copilot Guidelines - ZeQue

This document establishes standards, constraints, and operational patterns for developer copilots or AI agents contributing code to the **ZeQue** repository.

---

## 1. Architectural Integrity

- **Technology Stack Constraint**: Do not introduce alternative language stacks, state managers (e.g. Redux), or alternative database frameworks. Stick to React/Vite/Tailwind for frontend and Django/DRF/SimpleJWT for backend.
- **ORM Patterns**: Keep backend model changes consistent with the established conventions:
  - Primary keys must use `BigAutoField` named `id`.
  - Provide a unique alphanumeric `public_id` generated via `generate_random_id()` for client-facing exposures. Never expose raw database IDs in URLs or responses.
  - Track records with `created_at`, `updated_at`, and `deleted_at` (soft delete) timestamps where applicable.
  - Define custom `db_table` names in model metadata.
  - Name related fields explicitly using `related_name`.

---

## 2. API Design & Security

- **Data Serialization**:
  - Always validate incoming payloads inside serializers using Django validators before saving.
  - Handle potential exceptions (e.g., database constraint violations) gracefully, returning clear REST error messages.
- **Database Query Safety**:
  - Keep endpoints optimized against $N+1$ query scenarios. Utilize `.select_related()` for foreign key relations and `.prefetch_related()` for many-to-many fields.
  - Always use database aggregation methods (`Avg`, `Count`) for calculation queries. *Do not calculate aggregates in Python memory loops.*
- **Rate Limiting**:
  - Assign correct rate limit classes (`LoginRateThrottle`, `PaymentRateThrottle`, etc.) from `booking/throttles.py` to prevent security issues.

---

## 3. UI Styling & Theme Rules

- **Tailwind Rules**:
  - Use custom colors matching the **Heritage Midnight** theme (deep midnight blues, warm golds, charcoal). Avoid using generic Tailwind colors (e.g., plain red, blue, green).
  - Enforce responsiveness. Check components across mobile, tablet, and desktop breakpoints.
  - Add micro-animations (pure CSS hover scaling, transitions) to interactive components to maintain high visual appeal.

---

## 4. Quality Control Checklist

Before completing work:
1. **Migrations Check**: Run `python manage.py makemigrations` and verify that migrations are generated without errors.
2. **System Checks**: Run `python manage.py check` to verify configuration validity.
3. **Build Integrity**: Run `npm run build` inside the `frontend` folder to guarantee typescript and compiler passes succeed.
4. **Cwd Rule**: Ensure all terminal commands run inside the workspace directories. Never write or reference temporary files outside the project root.
