# Provider Portal & CSV Upload Flow - ZeQue

This document describes the provider and administrator portal experience, CSV data importing, and catalog management.

---

## 1. Provider Roles & Permissions

ZeQue supports administrative users who manage experiences, categories, locations, and view booking analytics. These users have specific roles defined in their profiles:
- **`provider`**: Reps from organizations or businesses (e.g., Science City Admin) managing their own experiences.
- **`official` / `admin`**: Authorities (e.g., ASI officers) with global permissions to modify states, cities, categories, and approve bulk bookings.

Access is secured via authentication tokens, routing through the endpoint `/api/official-portal/` which validates that `User_Data.role` is set to `official`, `provider`, or `admin`.

---

## 2. Catalog Import via CSV Upload

To support bulk data importing, the official portal implements a CSV processing pipeline:

```
┌─────────────────────────────────┐
│ Admin Uploads CSV via Frontend │
└────────────────┬────────────────┘
                 │
                 ▼ POST /api/official/upload-csv/ (multipart/form-data)
┌─────────────────────────────────┐
│ File Type Detection (States/    │
│ Cities/Categories/Experiences)  │
└────────────────┬────────────────┘
                 │
                 ▼ Read rows sequentially
┌─────────────────────────────────┐
│ Check duplicates by unique keys │
│ (e.g. name or code)             │
└────────────────┬────────────────┘
                 │
                 ▼ Save records to database
┌─────────────────────────────────┐
│ Return summary (Created/Skipped)│
└─────────────────────────────────┘
```

### Steps & Files Supported
The backend endpoint `/api/official/upload-csv/` accepts files and detects the target table based on column headers:
1. **States (`states.csv`)**: Reads columns `name`, `description`, `best_time`, `seo_title`, `seo_description`, `website`.
2. **Cities (`cities.csv`)**: Reads columns `name`, `description`, `state` (matches existing state name), `best_time`, `latitude`, `longitude`.
3. **Categories (`categories.csv`)**: Reads `name`, `description`, `icon_url`, `image_url`.
4. **Experiences (`experiences.csv`)**: Reads core catalog files, links to category and city, and defines `max_daily_capacity`, `entry_fee_base`, and hours.

---

## 3. Experience Management & Analytics Dashboard

Through the official dashboard, providers and officials can perform:
- **Catalog Management (`OfficialExperienceView`)**: Full CRUD operations on experiences. Creates unique `public_id` configurations automatically.
- **Admin Stats Overview (`OfficialMetaView`)**:
  - Fetches aggregated counts of total experiences, total cities, active categories.
  - Computes global booking statistics: total confirmed bookings, total revenue, refund rates, and daily check-in counts.
  - Queries are index-optimized using SQLite/PostgreSQL aggregation hooks to support fast page load speeds in the provider control panel.
