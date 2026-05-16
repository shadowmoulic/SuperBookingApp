from django.utils import timezone
from django.db import models
from django.core.validators import MinValueValidator


class Location(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(
        max_length=100, unique=True, help_text="e.g. temple, fort, museum"
    )
    icon_url = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = "location"

    def __str__(self):
        return self.name


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
        return self.name


class Experience(models.Model):
    id = models.BigAutoField(primary_key=True)
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
            models.Index(fields=["category"], name="idx_experience_category_id"),
            models.Index(fields=["name"], name="idx_experience_name"),
            models.Index(
                fields=["category", "is_open"],
                name="idx_category_is_open",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"

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


class PricingRule(models.Model):
    TICKET_TYPE_CHOICES = [
        ("adult", "Adult"),
        ("child", "Child"),
        ("senior", "Senior"),
    ]

    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name="pricing_rules",
        db_index=True,
        help_text="Monument/Experience this pricing applies to",
    )
    ticket_type = models.CharField(
        max_length=20,
        choices=TICKET_TYPE_CHOICES,
        null=False,
        help_text="Type of ticket (adult, child, senior)",
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
        return f"{self.experience.name} - {self.ticket_type} (₹{self.base_price})"

    class Meta:
        db_table = "pricing_rules"
        ordering = ["-valid_from"]
        unique_together = [("experience", "ticket_type", "valid_from", "valid_to")]
        indexes = [
            models.Index(fields=["experience"]),
            models.Index(
                fields=["experience", "ticket_type", "valid_from", "valid_to"],
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
