# Backend Modules - Content App

The `content` application manages the core catalog database of the platform, including states, cities, categories, providers, experiences, pricing structures, and curated trails.

---

## 1. Directory Structure

```
backend/content/
├── admin.py                # Admin register for states, cities, experiences, etc.
├── apps.py                 # App configuration
├── migrations/             # Database migration folders
├── models.py               # Core catalog models (State, City, Category, Provider, etc.)
└── tests.py
```

---

## 2. Catalog Database Models

The models declared in `backend/content/models.py` outline the master data tree:

```
                  ┌───────────┐
                  │   State   │
                  └─────┬─────┘
                        │
                  ┌─────▼─────┐
                  │   City    │
                  └─────┬─────┘
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│ Provider  │     │Experience │     │ Category  │
└─────┬─────┘     └─────▲─────┘     └───────────┘
      │                 │
      └────────┬────────┘
               │
               ▼
        ┌─────────────┐
        │ TicketType  │
        └─────┬───────┘
              │
              ▼
        ┌─────────────┐
        │ PricingRule │
        └─────────────┘
```

### 2.1 Geographic Hierarchy
- **`State`**: Represents geopolitical states (e.g. West Bengal). Includes descriptive SEO tags, website links, and featured images.
- **`City`**: Belongs to a single State. Stores coordinates (latitude/longitude) for map pins, descriptions, and icon images.

### 2.2 Providers & Ownership
- **`Provider`**: Represents the administrator of experiences (e.g., Science City, ASI Circle). Includes contact logs and site URLs. Supports soft-deletion via `deleted_at` to avoid breaking booking records.

### 2.3 Attraction Core
- **`Experience`**: Represents a physical monument or tour. Holds information on max capacity, geographic coordinates, base price, and hours. Points to a `Provider` (nullable) and a `Category`.
- **`OperatingHours`**: Declares standard opening and closing times for each day of the week, with an `is_closed` flag.
- **`ExperienceHighlight` / `ExperienceAttribute`**: Dynamic description pairs (e.g., "Wheelchair Accessible: Yes").

### 2.4 Ticket Configurations
- **`TicketType`**: Target tiers (e.g., student, foreign national) configures per experience.
- **`PricingRule`**: Sets price ranges and multipliers valid during seasonal intervals.

### 2.5 Curator Features
- **`Collection`**: Groupings of experiences matching a type (e.g., `trail`, `itinerary`).
- **`CollectionExperience`**: Join model managing ordered displays inside a collection.
