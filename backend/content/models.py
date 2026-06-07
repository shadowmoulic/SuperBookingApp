import secrets
import string
from django.utils import timezone
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


def generate_random_id(length=10):
    characters = string.ascii_letters + string.digits
    return "".join(secrets.choice(characters) for i in range(length))


class Location(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=10, unique=True, blank=True, editable=False)
    name = models.CharField(
        max_length=100, unique=True, help_text="e.g. temple, fort, museum"
    )
    icon_url = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = "location"
        indexes = [
            models.Index(fields=["public_id"], name="idx_locations_public_id"),
            models.Index(fields=["name"], name="idx_locations_name"),
        ]

    def __str__(self):
        return f"{self.name} - {self.public_id}"

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id(length=8)
                if not Location.objects.filter(public_id=f"l-{random_id}").exists():
                    self.public_id = f"l-{random_id}"
                    break
        super().save(*args, **kwargs)


class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(
        max_length=100, unique=True, help_text="e.g. temple, fort, museum"
    )
    description = models.TextField(blank=True, null=True)
    icon_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        indexes = [
            models.Index(fields=["name"], name="idx_categories_name"),
        ]
        constraints = [
            models.UniqueConstraint(fields=["name"], name="uq_categories_name"),
        ]

    def __str__(self):
        return f"{self.name}"


class Provider(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(
        blank=True, null=True, help_text="Soft delete — NULL means active"
    )

    class Meta:
        db_table = "provider"
        indexes = [
            models.Index(fields=["public_id"], name="idx_provider_public_id"),
            models.Index(fields=["name"], name="idx_provider_name"),
            models.Index(fields=["is_active"], name="idx_provider_is_active"),
        ]

    def __str__(self):
        return f"{self.name} - {self.public_id}"

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Provider.objects.filter(public_id=f"prov-{random_id}").exists():
                    self.public_id = f"prov-{random_id}"
                    break
        super().save(*args, **kwargs)


class Experience(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=12, unique=True, blank=True, editable=False)
    provider = models.ForeignKey(
        Provider,
        on_delete=models.SET_NULL,
        db_column="provider_id",
        related_name="experiences",
        null=True,
        blank=True,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        db_column="category_id",
        related_name="experiences",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        db_column="location_id",
        related_name="experiences",
    )
    latitude = models.DecimalField(
        max_digits=10, decimal_places=8, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=11, decimal_places=8, blank=True, null=True
    )
    image_url = models.CharField(max_length=500, blank=True, null=True)
    max_daily_capacity = models.IntegerField(help_text="Maximum visitors per day")
    entry_fee_base = models.DecimalField(max_digits=10, decimal_places=2)
    is_open = models.BooleanField(default=True)
    opening_time = models.TimeField(blank=True, null=True)
    closing_time = models.TimeField(blank=True, null=True)
    last_entry_time = models.TimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(
        blank=True, null=True, help_text="Soft delete — NULL means active"
    )

    class Meta:
        db_table = "experience"
        indexes = [
            models.Index(fields=["public_id"], name="idx_experience_public_id"),
            models.Index(fields=["category"], name="idx_experience_category"),
            models.Index(fields=["name"], name="idx_experience_name"),
            models.Index(
                fields=["category", "is_open"],
                name="idx_category_is_open",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.category_id}) - {self.public_id}"

    def soft_delete(self):
        """Mark the record as deleted without removing it from the DB."""
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self):
        """Undo a soft delete."""
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Experience.objects.filter(public_id=f"e-{random_id}").exists():
                    self.public_id = f"e-{random_id}"
                    break
        super().save(*args, **kwargs)


class TicketType(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        db_column="experience_id",
        related_name="ticket_types",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(
        blank=True, null=True, help_text="Soft delete — NULL means active"
    )

    class Meta:
        db_table = "ticket_type"
        indexes = [
            models.Index(fields=["public_id"], name="idx_ticket_type_public_id"),
            models.Index(fields=["experience"], name="idx_ticket_type_experience"),
            models.Index(fields=["name"], name="idx_ticket_type_name"),
            models.Index(fields=["is_active"], name="idx_ticket_type_is_active"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["experience", "name"],
                condition=models.Q(deleted_at__isnull=True),
                name="uq_ticket_type_experience_name_active",
            )
        ]

    def __str__(self):
        return f"{self.experience.name} - {self.name} ({self.public_id})"

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def clean(self):
        super().clean()
        if not self.deleted_at:
            duplicate_qs = TicketType.objects.filter(
                experience=self.experience,
                name__iexact=self.name,
                deleted_at__isnull=True
            )
            if self.pk:
                duplicate_qs = duplicate_qs.exclude(pk=self.pk)
            if duplicate_qs.exists():
                raise ValidationError("An active ticket type with this name already exists for this experience.")

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not TicketType.objects.filter(public_id=f"tt-{random_id}").exists():
                    self.public_id = f"tt-{random_id}"
                    break
        super().save(*args, **kwargs)


class PricingRule(models.Model):
    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.CASCADE,
        related_name="pricing_rules",
        db_column="ticket_type_id",
        null=True,
        blank=True,
        help_text="Ticket type this pricing applies to",
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=False,
        validators=[MinValueValidator(0.00)],
        help_text="Base price for this ticket type",
    )
    seasonal_multiplier = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        validators=[MinValueValidator(0.0)],
        help_text="1.5 for peak season, 0.8 for off-season",
    )
    valid_from = models.DateField(
        null=False, help_text="Start date for this pricing rule"
    )
    valid_to = models.DateField(
        blank=True, null=True, help_text="End date. NULL means ongoing"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_final_price(self):
        """Calculate final price after applying seasonal multiplier."""
        return self.base_price * self.seasonal_multiplier

    def is_active(self):
        """Check if pricing rule is currently active."""
        from django.utils import timezone

        today = timezone.now().date()

        if self.valid_to:
            return self.valid_from <= today <= self.valid_to
        return self.valid_from <= today

    def is_ongoing(self):
        """Check if pricing rule has no end date."""
        return self.valid_to is None

    def __str__(self):
        ticket_type_name = self.ticket_type.name if self.ticket_type else "Unknown"
        experience_name = self.ticket_type.experience.name if self.ticket_type and self.ticket_type.experience else "Unknown"
        return f"{experience_name} - {ticket_type_name} (₹{self.base_price})"

    class Meta:
        db_table = "pricing_rules"
        ordering = ["-valid_from"]
        unique_together = [("ticket_type", "valid_from", "valid_to")]
        indexes = [
            models.Index(fields=["ticket_type"]),
            models.Index(
                fields=["ticket_type", "valid_from", "valid_to"],
                name="pricing_composite_idx",
            ),
        ]


class OperatingHours(models.Model):
    DAY_OF_WEEK_CHOICES = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday"),
    ]

    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name="operating_hours",
        db_index=True,
        help_text="Monument/Experience these hours apply to",
    )
    day_of_week = models.CharField(
        max_length=10,
        choices=DAY_OF_WEEK_CHOICES,
        null=False,
        help_text="Day of the week",
    )
    opens_at = models.TimeField(
        blank=True, null=True, help_text="Opening time (NULL if closed)"
    )
    closes_at = models.TimeField(
        blank=True, null=True, help_text="Closing time (NULL if closed)"
    )
    is_closed = models.BooleanField(
        default=False, help_text="True if closed on this day"
    )
    special_closure_reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Reason for closure (e.g., Maintenance, Holiday)",
    )

    def is_open_now(self):
        """Check if experience is open at current time."""
        now = timezone.now()
        current_day = now.strftime("%A")  # Monday, Tuesday, etc.
        current_time = now.time()

        # Check if it's the correct day
        if self.day_of_week != current_day:
            return False

        # Check if closed
        if self.is_closed:
            return False

        # Check if time is within operating hours
        if self.opens_at and self.closes_at:
            return self.opens_at <= current_time <= self.closes_at

        return False

    def get_hours_display(self):
        """Get human-readable hours."""
        if self.is_closed:
            reason = (
                f" - {self.special_closure_reason}"
                if self.special_closure_reason
                else ""
            )
            return f"Closed{reason}"

        if self.opens_at and self.closes_at:
            return f"{self.opens_at.strftime('%H:%M')} - {self.closes_at.strftime('%H:%M')}"

        return "Hours not set"

    def __str__(self):
        return (
            f"{self.experience.name} - {self.day_of_week}: {self.get_hours_display()}"
        )

    class Meta:
        db_table = "operating_hours"
        ordering = ["day_of_week"]
        unique_together = [("experience", "day_of_week")]
        indexes = [
            models.Index(fields=["experience"]),
        ]


class Trip(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    # The user is the Django auth.User (which stores the Supabase UUID in its username)
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="trips")
    title = models.CharField(max_length=255)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips")
    days = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trips"

    def __str__(self):
        return f"{self.title} by {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Trip.objects.filter(public_id=f"t-{random_id}").exists():
                    self.public_id = f"t-{random_id}"
                    break
        super().save(*args, **kwargs)


class TripAttraction(models.Model):
    id = models.BigAutoField(primary_key=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="trip_attractions")
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE)
    day_number = models.IntegerField(default=1)
    sequence = models.IntegerField(default=1)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "trip_attractions"
        ordering = ["day_number", "sequence"]
        unique_together = [("trip", "experience")]

    def __str__(self):
        return f"{self.trip.title} - Day {self.day_number}: {self.experience.name}"


class Collection(models.Model):
    COLLECTION_TYPE_CHOICES = [
        ("trail", "Trail"),
        ("itinerary", "Itinerary"),
        ("featured", "Featured"),
        ("recommended", "Recommended"),
        ("seasonal", "Seasonal"),
    ]

    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    collection_type = models.CharField(
        max_length=20,
        choices=COLLECTION_TYPE_CHOICES,
        default="featured",
    )
    image_url = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(
        blank=True, null=True, help_text="Soft delete — NULL means active"
    )

    class Meta:
        db_table = "collections"
        indexes = [
            models.Index(fields=["public_id"], name="idx_collections_public_id"),
            models.Index(fields=["collection_type"], name="idx_collections_type"),
            models.Index(fields=["is_active"], name="idx_collections_is_active"),
        ]

    def __str__(self):
        return f"{self.name} ({self.collection_type}) - {self.public_id}"

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Collection.objects.filter(public_id=f"col-{random_id}").exists():
                    self.public_id = f"col-{random_id}"
                    break
        super().save(*args, **kwargs)


class CollectionExperience(models.Model):
    id = models.BigAutoField(primary_key=True)
    collection = models.ForeignKey(
        Collection,
        on_delete=models.CASCADE,
        db_column="collection_id",
        related_name="collection_experiences",
    )
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        db_column="experience_id",
        related_name="collection_experiences",
    )
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "collection_experiences"
        ordering = ["display_order"]
        indexes = [
            models.Index(fields=["collection"], name="idx_coll_exp_collection"),
            models.Index(fields=["experience"], name="idx_coll_exp_experience"),
            models.Index(fields=["display_order"], name="idx_coll_exp_display_order"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["collection", "experience"],
                name="uq_collection_experience",
            )
        ]

    def __str__(self):
        return f"{self.collection.name} -> {self.experience.name} (order: {self.display_order})"

