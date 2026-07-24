from django.db import models
from django.utils import timezone
from io import BytesIO
import qrcode
from user.models import User_Data
from content.models import Experience, PricingRule, generate_random_id
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
import uuid


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("used", "Used"),  # Changed from 'completed' to match DBML
    ]

    REFUND_STATUS_CHOICES = [
        ("none", "None"),
        ("requested", "Requested"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    id = models.BigAutoField(primary_key=True)
    reference = models.CharField(max_length=50, unique=True, db_index=True, null=False)
    user = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="bookings", db_index=True
    )
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name="experience",
        db_index=True,
    )
    booking_date = models.DateField(null=False, db_index=True)
    total_tickets = models.IntegerField(null=False)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    refund_status = models.CharField(
        max_length=20,
        choices=REFUND_STATUS_CHOICES,
        blank=True,
        null=True,
        default="none",
    )
    special_requests = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def cancel(self, reason=None):
        """Cancel the booking with an optional reason."""
        self.status = "cancelled"
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save()

    def is_cancelled(self):
        return self.status == "cancelled"

    def save(self, *args, **kwargs):
        if not self.reference:
            while True:
                ref = f"BK-{uuid.uuid4().hex[:12].upper()}"
                if not Booking.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.status}"

    class Meta:
        db_table = "bookings"
        ordering = ["-booking_date"]
        indexes = [
            models.Index(fields=["reference"], name="idx_booking_reference"),
            models.Index(
                fields=["experience", "booking_date", "status"],
                name="idx_booking_exp_date_status",
            ),
        ]


class BookingItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
        help_text="Booking this item belongs to",
    )
    ticket_type = models.ForeignKey(
        "content.TicketType",
        on_delete=models.CASCADE,
        related_name="booking_items",
        db_index=True,
        help_text="Ticket type associated with this booking item",
    )
    time_slot = models.ForeignKey(
        "TicketTypeSchedule",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="booking_items",
        db_index=True,
        help_text="Scheduled time slot for this booking item",
    )
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    nationality_category = models.CharField(
        max_length=20,
        choices=PricingRule.NATIONALITY_CHOICES,
        default="Any",
        blank=True,
        null=True,
        help_text="Nationality category for this item",
    )
    age_category = models.CharField(
        max_length=20,
        choices=PricingRule.AGE_CHOICES,
        default="Any",
        blank=True,
        null=True,
        help_text="Age category for this item",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.subtotal:
            self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        ticket_type_name = self.ticket_type.name if self.ticket_type else "Unknown"
        return f"{self.quantity}x {ticket_type_name} (Booking {self.booking.reference})"

    class Meta:
        db_table = "booking_items"
        ordering = ["id"]
        indexes = [
            models.Index(fields=["booking_id"]),
            models.Index(fields=["ticket_type_id"]),
            models.Index(fields=["time_slot_id"]),
        ]


class Ticket(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking_item = models.ForeignKey(
        BookingItem,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="tickets",
        db_index=True,
        help_text="Booking item this ticket was issued for",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=False,
        help_text="Price paid for this ticket",
    )
    qr_code = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        null=False,
        help_text="QR code for entry verification",
    )
    is_used = models.BooleanField(
        default=False, db_index=True, help_text="Whether ticket has been used for entry"
    )
    used_at = models.DateTimeField(
        blank=True, null=True, help_text="When ticket was scanned/used"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def mark_as_used(self):
        """Mark ticket as used when scanned at entry."""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()

    def is_valid(self):
        """Check if ticket is valid (not used yet)."""
        return not self.is_used

    def generate_qr_code(self):
        """Generate QR code for this ticket."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self.qr_code)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        return img

    def get_qr_code_image_base64(self):
        """Get QR code as base64 string for API response."""
        import base64

        img = self.generate_qr_code()
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"

    def __str__(self):
        status = "✓ Used" if self.is_used else "✗ Unused"
        type_name = self.booking_item.ticket_type.name if (self.booking_item and self.booking_item.ticket_type) else "Unknown"
        return f"Ticket {self.qr_code} - {type_name} [{status}]"

    class Meta:
        db_table = "tickets"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["booking_item_id"]),
            models.Index(fields=["qr_code"]),
            models.Index(fields=["is_used"]),
        ]


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("card", "Credit/Debit Card"),
        ("upi", "UPI"),
        ("wallet", "Digital Wallet"),
        ("bank_transfer", "Bank Transfer"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_GATEWAY_CHOICES = [
        ("razorpay", "Razorpay"),
        ("stripe", "Stripe"),
        ("paypal", "PayPal"),
    ]

    id = models.BigAutoField(primary_key=True)
    reference = models.CharField(max_length=100, unique=True, db_index=True, null=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="payments",
        db_index=True,
    )
    user = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="payments", db_index=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, null=False
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    payment_gateway = models.CharField(
        max_length=50,
        choices=PAYMENT_GATEWAY_CHOICES,
        blank=True,
        null=True,
        help_text="Which payment gateway processed this",
    )
    gateway_transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Transaction ID from the payment gateway",
    )
    error_message = models.TextField(
        blank=True, null=True, help_text="Error details if payment failed"
    )
    paid_at = models.DateTimeField(
        blank=True, null=True, help_text="When the payment was successfully processed"
    )
    refunded_at = models.DateTimeField(
        blank=True, null=True, help_text="When the payment was refunded"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def mark_success(self):
        """Mark payment as successful."""
        self.status = "success"
        self.paid_at = timezone.now()
        self.save()

    def mark_failed(self, error_msg=None):
        """Mark payment as failed with optional error message."""
        self.status = "failed"
        self.error_message = error_msg
        self.save()

    def mark_refunded(self):
        """Mark payment as refunded."""
        self.status = "refunded"
        self.refunded_at = timezone.now()
        self.save()

    def is_successful(self):
        return self.status == "success"

    def is_failed(self):
        return self.status == "failed"

    def is_refunded(self):
        return self.status == "refunded"

    def __str__(self):
        return f"{self.reference} - {self.status}"

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["reference"], name="idx_payments_reference"),
            models.Index(fields=["user", "status"], name="idx_payments_user_status"),
            models.Index(fields=["created_at"], name="idx_payments_created_at"),
        ]

    def save(self, *args, **kwargs):
        if not self.reference:
            while True:
                ref = f"PAY-{uuid.uuid4().hex[:12].upper()}"
                if not Payment.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
        super().save(*args, **kwargs)


class Schedule(models.Model):
    RECURRENCE_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("specific-date", "Specific Date"),
        ("range", "Range"),
    ]

    experience = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="schedules"
    )
    recurrence_type = models.CharField(max_length=20, choices=RECURRENCE_CHOICES)
    specific_date = models.DateField(blank=True, null=True)
    monday = models.BooleanField(default=False, help_text="Applies on Monday")
    tuesday = models.BooleanField(default=False, help_text="Applies on Tuesday")
    wednesday = models.BooleanField(default=False, help_text="Applies on Wednesday")
    thursday = models.BooleanField(default=False, help_text="Applies on Thursday")
    friday = models.BooleanField(default=False, help_text="Applies on Friday")
    saturday = models.BooleanField(default=False, help_text="Applies on Saturday")
    sunday = models.BooleanField(default=False, help_text="Applies on Sunday")
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    capacity = models.IntegerField()
    available_capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "schedules"

    def clean(self):
        super().clean()
        if self.capacity is not None and self.capacity < 0:
            raise ValidationError("Capacity cannot be negative.")
        if self.available_capacity is not None and self.available_capacity < 0:
            raise ValidationError("Available capacity cannot be negative.")
        if (
            self.available_capacity is not None
            and self.capacity is not None
            and self.available_capacity > self.capacity
        ):
            raise ValidationError("Available capacity cannot exceed total capacity.")

        if self.recurrence_type == "specific-date" and not self.specific_date:
            raise ValidationError("specific_date is required for specific-date recurrence.")
        if self.recurrence_type == "weekly":
            has_any_day = any([
                self.monday, self.tuesday, self.wednesday,
                self.thursday, self.friday, self.saturday, self.sunday
            ])
            if not has_any_day:
                raise ValidationError("At least one weekday must be selected for weekly recurrence.")
        if self.recurrence_type == "range" and (not self.start_date or not self.end_date):
            raise ValidationError("start_date and end_date are required for range recurrence.")

    def is_available_on_date(self, target_date):
        """Check if schedule is active and available on a given date."""
        if not self.is_active:
            return False

        if self.start_date and target_date < self.start_date:
            return False
        if self.end_date and target_date > self.end_date:
            return False

        if self.recurrence_type == "specific-date":
            return self.specific_date == target_date

        if self.recurrence_type == "weekly":
            weekday = target_date.weekday()
            days_map = {
                0: self.monday,
                1: self.tuesday,
                2: self.wednesday,
                3: self.thursday,
                4: self.friday,
                5: self.saturday,
                6: self.sunday,
            }
            return days_map.get(weekday, False)

        if self.recurrence_type in ("daily", "range"):
            return True

        return True

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        exp_name = self.experience.name if self.experience else "Unknown Experience"
        return f"{exp_name} schedule ({self.recurrence_type}) {self.start_time}-{self.end_time}"


class TicketTypeSchedule(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    ticket_type = models.ForeignKey(
        "content.TicketType",
        on_delete=models.CASCADE,
        related_name="ticket_type_schedules",
        db_index=True,
    )
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name="ticket_type_schedules",
        db_index=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket_type_schedules"
        unique_together = [("ticket_type", "schedule")]
        indexes = [
            models.Index(fields=["ticket_type"]),
            models.Index(fields=["schedule"]),
        ]

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not TicketTypeSchedule.objects.filter(public_id=f"tts-{random_id}").exists():
                    self.public_id = f"tts-{random_id}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        tt_name = self.ticket_type.name if self.ticket_type else "Unknown"
        return f"{tt_name} - Schedule {self.schedule_id} ({self.public_id})"


class Inventory(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    ticket_type = models.ForeignKey(
        "content.TicketType",
        on_delete=models.CASCADE,
        related_name="inventories",
        db_index=True,
    )
    time_slot = models.ForeignKey(
        TicketTypeSchedule,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="inventories",
        db_index=True,
    )
    date = models.DateField(db_index=True)
    capacity = models.IntegerField(validators=[MinValueValidator(0)])
    reserved_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    confirmed_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    used_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    cancelled_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    blocked_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_open = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory"
        indexes = [
            models.Index(fields=["ticket_type"], name="idx_inventory_ticket_type"),
            models.Index(fields=["date"], name="idx_inventory_date"),
            models.Index(fields=["is_open"], name="idx_inventory_is_open"),
        ]

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Inventory.objects.filter(public_id=f"inv-{random_id}").exists():
                    self.public_id = f"inv-{random_id}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        tt_name = self.ticket_type.name if self.ticket_type else "Unknown"
        return f"{tt_name} - {self.date} (Cap: {self.capacity})"


class Seat(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("reserved", "Reserved"),
        ("booked", "Booked"),
    ]

    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name="seats"
    )
    seat_number = models.CharField(max_length=50)
    seat_type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )

    class Meta:
        db_table = "seats"
        unique_together = [("schedule", "seat_number")]

    def __str__(self):
        return f"Seat {self.seat_number} - {self.status} (Schedule {self.schedule.id})"


class BulkBookingRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    public_id = models.CharField(
        max_length=15, unique=True, blank=True, editable=False
    )
    enterprise = models.ForeignKey(
        "user.Enterprise",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="bulk_requests",
    )
    user = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="bulk_requests"
    )
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE)
    ticket_type = models.ForeignKey("content.TicketType", on_delete=models.CASCADE)
    booking_date = models.DateField()
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    approved_by = models.ForeignKey(
        User_Data,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="approved_bulk_requests",
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bulk_booking_requests"

    def save(self, *args, **kwargs):
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not BulkBookingRequest.objects.filter(
                    public_id=f"bb-{random_id}"
                ).exists():
                    self.public_id = f"bb-{random_id}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.public_id} - {self.quantity} tickets for {self.experience.name} ({self.status})"

