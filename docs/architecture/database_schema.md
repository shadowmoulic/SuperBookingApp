# Relational Database Schema - ZeQue

This document details the database schema, field constraints, unique keys, and relationship layouts for the **ZeQue** platform.

---

## 1. Schema Relationships (Overview)

The database schema is organized into four core Django applications:
1. **`content`**: Master Catalog entities (States, Cities, Categories, Providers, Experiences, Ticket Tiers, Collections).
2. **`booking`**: Transactional flow entities (Bookings, Tickets, Payments, Inventory constraints).
3. **`user`**: User authentication profiles and Enterprise account details.
4. **`reviews`**: User-contributed feedback metrics.
5. **`authentication`**: Uses Django's built-in system authentication models.

---

## 2. Model Schema Specification

### 2.1 Content App Models

#### State
Represents states containing cities and historical monuments.
- **Table**: `states`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `name` (CharField, unique)
  - `description` (TextField, optional)
  - `image_url` (CharField, optional)
  - `best_time` (CharField, optional)
  - `seo_title` (CharField, optional)
  - `seo_description` (TextField, optional)
  - `website` (URLField, optional)

#### City
Represents cities within a state.
- **Table**: `cities`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `name` (CharField, unique)
  - `description` (TextField, optional)
  - `state_id` (ForeignKey to `State`, nullable, related_name `cities`)
  - `icon_url` (CharField, optional)
  - `image_url` (CharField, optional)
  - `best_time` (CharField, optional)
  - `seo_title` (CharField, optional)
  - `seo_description` (TextField, optional)
  - `latitude` (DecimalField, optional)
  - `longitude` (DecimalField, optional)

#### Category
Represents categories of experiences (e.g. temple, fort, museum).
- **Table**: `categories`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `name` (CharField, unique)
  - `description` (TextField, optional)
  - `icon_url` (CharField, optional)
  - `image_url` (CharField, optional)
  - `seo_title` (CharField, optional)
  - `seo_description` (TextField, optional)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### Provider
Represents the organization/authority managing monuments (e.g., ASI, Victoria Memorial Authority).
- **Table**: `provider`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `name` (CharField)
  - `description` (TextField, optional)
  - `contact_email` (EmailField, optional)
  - `contact_phone` (CharField, optional)
  - `website_url` (URLField, optional)
  - `is_active` (BooleanField, default `True`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, nullable, for soft-delete)

#### Experience (Monument/Attraction)
The core physical attraction or experience that can be booked.
- **Table**: `experience`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `provider_id` (ForeignKey to `Provider`, nullable, related_name `experiences`)
  - `category_id` (ForeignKey to `Category`, related_name `experiences`)
  - `name` (CharField)
  - `subtitle` (CharField, optional)
  - `description` (TextField, optional)
  - `address` (CharField, optional)
  - `city_id` (ForeignKey to `City`, nullable, related_name `experiences`)
  - `latitude` (DecimalField, optional)
  - `longitude` (DecimalField, optional)
  - `image_url` (CharField, optional)
  - `max_daily_capacity` (IntegerField, total daily ticket cap)
  - `entry_fee_base` (DecimalField)
  - `is_open` (BooleanField, default `True`)
  - `opening_time` (TimeField, optional)
  - `closing_time` (TimeField, optional)
  - `time_required` (DurationField, optional)
  - `last_entry_time` (TimeField, optional)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, nullable)

#### TicketType
Purchasable variants/tiers for an Experience (e.g., Foreign Adult, Child, Student).
- **Table**: `ticket_type`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `experience_id` (ForeignKey to `Experience`, related_name `ticket_types`)
  - `name` (CharField)
  - `description` (TextField, optional)
  - `is_active` (BooleanField, default `True`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, nullable)

#### PricingRule
Defines ticket pricing, seasonal adjustments, and price points per ticket type.
- **Table**: `pricing_rules`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `ticket_type_id` (ForeignKey to `TicketType`, related_name `pricing_rules`)
  - `base_price` (DecimalField)
  - `seasonal_multiplier` (DecimalField, default `1.0`)
  - `valid_from` (DateField)
  - `valid_to` (DateField, optional)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### OperatingHours
Specifies weekly opening and closing schedules for Experiences.
- **Table**: `operating_hours`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `experience_id` (ForeignKey to `Experience`, related name `operating_hours`)
  - `day_of_week` (CharField)
  - `opens_at` (TimeField, nullable)
  - `closes_at` (TimeField, nullable)
  - `is_closed` (BooleanField, default `False`)
  - `special_closure_reason` (CharField, nullable)

#### Trip
Represents a user-created itinerary.
- **Table**: `trips`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `user_id` (ForeignKey to standard system `User`, related name `trips`)
  - `title` (CharField)
  - `location_id` (ForeignKey to `City`, related name `trips`, nullable)
  - `days` (IntegerField, default `1`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### TripAttraction
Mapping table linking Experiences to user itineraries.
- **Table**: `trip_attractions`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `trip_id` (ForeignKey to `Trip`, related name `trip_attractions`)
  - `experience_id` (ForeignKey to `Experience`)
  - `day_number` (IntegerField, default `1`)
  - `sequence` (IntegerField, default `1`)
  - `notes` (TextField, nullable)

#### Collection
Curated groups of Experiences (e.g., "Kolkata Heritage Trail").
- **Table**: `collections`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique, index)
  - `name` (CharField)
  - `description` (TextField, optional)
  - `collection_type` (CharField, default `"featured"`)
  - `image_url` (CharField, optional)
  - `is_active` (BooleanField, default `True`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, nullable)

#### CollectionExperience
Mapping table linking Experiences to Collection groups.
- **Table**: `collection_experiences`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `collection_id` (ForeignKey to `Collection`, related name `collection_experiences`)
  - `experience_id` (ForeignKey to `Experience`, related name `collection_experiences`)
  - `display_order` (IntegerField, default `0`)
  - `created_at` (DateTimeField)

#### BookingPolicy
Defines cancellation, refund, confirmation, and validity rules per TicketType.
- **Table**: `booking_policies`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `ticket_type_id` (OneToOneField to `TicketType`, related name `booking_policy`)
  - `instant_confirmation` (BooleanField, default `True`)
  - `requires_manual_confirmation` (BooleanField, default `False`)
  - `cancellation_allowed` (BooleanField, default `True`)
  - `cancellation_before_hours` (IntegerField, default `24`)
  - `refund_allowed` (BooleanField, default `True`)
  - `validity_type` (CharField, default `"fixed"`)
  - `validity_duration` (DurationField, nullable)
  - `slot_booking_required` (BooleanField, default `True`)
  - `qr_reusable` (BooleanField, default `False`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### TicketFeature
Lists features, inclusions, or requirements for a TicketType.
- **Table**: `ticket_features`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `ticket_type_id` (ForeignKey to `TicketType`, related name `ticket_features`)
  - `feature_type` (CharField)
  - `title` (CharField)
  - `description` (TextField, nullable)
  - `display_order` (IntegerField, default `0`)

#### ExperienceHighlight
Short descriptive callout details associated with an Experience.
- **Table**: `experience_highlights`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `experience_id` (ForeignKey to `Experience`, related name `highlights`)
  - `title` (CharField)
  - `icon` (CharField, nullable)
  - `display_order` (IntegerField, default `0`)

#### ExperienceAttribute
Key-value metadata parameters defined per Experience.
- **Table**: `experience_attributes`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `experience_id` (ForeignKey to `Experience`, related name `attributes`)
  - `key` (CharField)
  - `value` (CharField)
  - `display_order` (IntegerField, default `0`)

#### ProviderBookingConfiguration
Custom booking rules and limits configured per Provider.
- **Table**: `provider_booking_configurations`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `provider_id` (OneToOneField to `Provider`, related name `booking_configuration`)
  - `max_individual_booking` (IntegerField, default `10`)
  - `max_group_booking` (IntegerField, default `20`)
  - `allow_bulk_booking` (BooleanField, default `True`)
  - `require_manual_bulk_approval` (BooleanField, default `True`)
  - `require_email_verification` (BooleanField, default `False`)
  - `require_phone_verification` (BooleanField, default `False`)
  - `require_captcha` (BooleanField, default `False`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

---

### 2.2 Booking App Models

#### Booking
Represents the customer reservation transaction.
- **Table**: `bookings`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `reference` (CharField, unique, index)
  - `user_id` (ForeignKey to `User_Data`, related name `bookings`)
  - `experience_id` (ForeignKey to `Experience`, related name `experience`)
  - `booking_date` (DateField, index)
  - `slot_time` (TimeField, optional)
  - `total_tickets` (IntegerField)
  - `total_amount` (DecimalField)
  - `status` (CharField, default `"pending"`, index)
  - `cancelled_at` (DateTimeField, nullable)
  - `cancellation_reason` (TextField, nullable)
  - `refund_amount` (DecimalField, nullable)
  - `refund_status` (CharField, default `"none"`, nullable)
  - `special_requests` (TextField, nullable)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, nullable)

#### Ticket
Issued entry tickets associated with a successful Booking.
- **Table**: `tickets`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `booking_id` (ForeignKey to `Booking`, related name `tickets`)
  - `ticket_type` (CharField)
  - `price` (DecimalField)
  - `qr_code` (CharField, unique, index)
  - `is_used` (BooleanField, default `False`, index)
  - `used_at` (DateTimeField, nullable)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### Payment
Records transaction information for booking checkouts.
- **Table**: `payments`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `reference` (CharField, unique, index)
  - `booking_id` (ForeignKey to `Booking`, related name `payments`)
  - `user_id` (ForeignKey to `User_Data`, related name `payments`)
  - `amount` (DecimalField)
  - `payment_method` (CharField)
  - `status` (CharField, default `"pending"`, index)
  - `payment_gateway` (CharField, nullable)
  - `gateway_transaction_id` (CharField, nullable)
  - `error_message` (TextField, nullable)
  - `paid_at` (DateTimeField, nullable)
  - `refunded_at` (DateTimeField, nullable)
  - `created_at` (DateTimeField, index)
  - `updated_at` (DateTimeField)

#### Inventory
Tracks and constraints daily capacities per Experience.
- **Table**: `inventory`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique)
  - `experience_id` (ForeignKey to `Experience`, related name `inventories`)
  - `inventory_date` (DateField)
  - `total_capacity` (IntegerField)
  - `available_capacity` (IntegerField)
  - `reserved_capacity` (IntegerField)
  - `is_closed` (BooleanField, default `False`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### Schedule
Defines recurrent booking slots and capacities for a TicketType.
- **Table**: `schedules`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `ticket_type_id` (ForeignKey to `content.TicketType`, related name `schedules`)
  - `recurrence_type` (CharField)
  - `specific_date` (DateField, nullable)
  - `day_of_week` (PositiveSmallIntegerField, nullable)
  - `start_date` (DateField, nullable)
  - `end_date` (DateField, nullable)
  - `start_time` (TimeField)
  - `end_time` (TimeField)
  - `capacity` (IntegerField)
  - `available_capacity` (IntegerField)
  - `is_active` (BooleanField, default `True`)

#### Seat
Represents individual seats or allocations within a Schedule.
- **Table**: `seats`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `schedule_id` (ForeignKey to `Schedule`, related name `seats`)
  - `seat_number` (CharField)
  - `seat_type` (CharField, nullable)
  - `status` (CharField, default `"available"`)

#### BulkBookingRequest
Pending requests for booking high ticket quantities.
- **Table**: `bulk_booking_requests`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `public_id` (CharField, unique)
  - `enterprise_id` (ForeignKey to `user.Enterprise`, nullable, related name `bulk_requests`)
  - `user_id` (ForeignKey to `User_Data`, related name `bulk_requests`)
  - `experience_id` (ForeignKey to `Experience`)
  - `ticket_type_id` (ForeignKey to `content.TicketType`)
  - `booking_date` (DateField)
  - `quantity` (IntegerField)
  - `notes` (TextField, nullable)
  - `status` (CharField, default `"pending"`)
  - `approved_by_id` (ForeignKey to `User_Data`, nullable, related name `approved_bulk_requests`)
  - `approved_at` (DateTimeField, nullable)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

---

### 2.3 User App Models

#### User_Data
Stores extended profile information on Django `User` accounts.
- **Table**: `users`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `user_id` (OneToOneField to Django system `User`, related name `user_data`)
  - `mobile` (CharField, optional)
  - `role` (CharField)
  - `is_active` (BooleanField, default `True`)
  - `email_verified` (BooleanField, default `False`)
  - `phone_verified` (BooleanField, default `False`)
  - `profile_picture_url` (CharField, optional)
  - `preferred_notification` (CharField, optional)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)
  - `deleted_at` (DateTimeField, optional)

#### Enterprise
Represents organizations making bulk or corporate bookings.
- **Table**: `enterprises`
- **Fields**:
  - `id` (AutoField/BigAutoField, PK)
  - `public_id` (CharField, unique)
  - `organization_name` (CharField)
  - `organization_type` (CharField, default `"other"`)
  - `gst_number` (CharField, optional)
  - `contact_person` (CharField)
  - `contact_email` (EmailField)
  - `contact_phone` (CharField)
  - `website` (URLField, optional)
  - `verification_status` (CharField, default `"pending"`)
  - `is_active` (BooleanField, default `True`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

#### EnterpriseMember
Links `User_Data` accounts with `Enterprise` organization entities.
- **Table**: `enterprise_members`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `enterprise_id` (ForeignKey to `Enterprise`, related name `members`)
  - `user_id` (ForeignKey to `User_Data`, related name `enterprise_memberships`)
  - `role` (CharField, default `"viewer"`)
  - `created_at` (DateTimeField)
  - `updated_at` (DateTimeField)

---

### 2.4 Reviews App Models

#### Review
Feedback and ratings for visited experiences.
- **Table**: `reviews`
- **Fields**:
  - `id` (BigAutoField, PK)
  - `user_id` (ForeignKey to `User_Data`)
  - `experience_id` (ForeignKey to `Experience`, related name `reviews`)
  - `rating` (IntegerField, between 1 and 5)
  - `comment` (TextField)
  - `created_at` (DateTimeField, auto now add)

---

### 2.5 Authentication App Models
The `authentication` app does not define any custom database tables. It relies entirely on Django's built-in system authentication models (e.g., standard `User`, `Group`, `Permission`) for managing credentials, security groups, and token/session validation contexts.