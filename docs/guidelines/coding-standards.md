# Unified Coding Standards - ZeQue

This document establishes coding standards, naming conventions, and code organization rules for backend and frontend development.

---

## 1. General Principles

- **DRY (Don't Repeat Yourself)**: Extract common operations (e.g. database query helpers, date formatters) into shared utility classes or services.
- **Maintainability**: Document complex algorithms or regex validations using inline comments.
- **Linter & Formatter Rules**:
  - **Backend**: Use `Black` for formatting and `Flake8` for PEP 8 compliance checks.
  - **Frontend**: Enforce coding standards using `ESLint` configuration rules.

---

## 2. Backend Design Standards (Python / Django)

### 2.1 Model Conventions
- **Class Names**: Use singular CamelCase (e.g. `TicketType`, `PricingRule`).
- **Table Names**: Always specify explicit lowercase table names in `Meta.db_table` (e.g. `bookings`, `provider`).
- **Foreign Keys**: Explicitly define `on_delete` policies and configure reasonable `related_name` labels.

### 2.2 Serializer Conventions
- **Explicit Field Declarations**:
  - Never use `fields = '__all__'`. Explicitly declare lists of columns:
    ```python
    class Meta:
        model = State
        fields = ['public_id', 'name', 'description', 'image_url']
    ```
- **Validation**: Implement clean, granular validations to return structured JSON errors instead of unhandled database exception errors.

### 2.3 Service Layer
- Put core business logic in static/class methods inside the app's `services.py` file. Keep models and views lightweight.

---

## 3. Frontend Design Standards (React / Vite / Tailwind)

### 3.1 Component Organization
- **Pages**: Capitalized camelcase files placed in `frontend/src/pages/` (e.g., `CategoryDetails.jsx`).
- **Components**: Reusable blocks placed in `frontend/src/components/` (e.g., `ExperienceCard.jsx`).
- **Tree Splitting**: If a page component exceeds **300 lines** of JSX layout, split sections into sub-components.

### 3.2 State Management Rules
- Use local hooks (`useState`, `useMemo`) for component-specific actions.
- Use context APIs (`useContext`) for global application states (auth status, locale, theme, location).
- Avoid caching data inside page components; use the Axios client cache loader.

### 3.3 CSS & Tailwind CSS Uses
- Style pages using Tailwind CSS class hierarchies.
- Use mobile-first viewport design. Define layouts recursively from `sm:` up to `xl:` breakpoints.
- Adhere strictly to the design guide color palette (Heritage Midnight) and typography tokens.
