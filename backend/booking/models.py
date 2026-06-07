from django.db import models
from django.utils import timezone
from io import BytesIO
import qrcode
from user.models import User_Data
from content.models import Experience, generate_random_id
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
    slot_time = models.TimeField(blank=True, null=True)
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


class Ticket(models.Model):
    TICKET_TYPE_CHOICES = [
        ("adult", "Adult"),
        ("child", "Child"),
        ("senior", "Senior"),
    ]

    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="tickets",
        db_index=True,
        help_text="Booking this ticket belongs to",
    )
    ticket_type = models.CharField(
        max_length=20,
        choices=TICKET_TYPE_CHOICES,
        null=False,
        help_text="Type of ticket (adult, child, senior)",
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
        return f"Ticket {self.qr_code} - {self.ticket_type} [{status}]"

    class Meta:
        db_table = "tickets"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["booking_id"]),
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
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment",
        unique=True,
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


class Inventory(models.Model):
    id = models.BigAutoField(primary_key=True)
    public_id = models.CharField(max_length=15, unique=True, blank=True, editable=False)
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        db_column="experience_id",
        related_name="inventories",
    )
    inventory_date = models.DateField()
    total_capacity = models.IntegerField(validators=[MinValueValidator(0)])
    available_capacity = models.IntegerField(validators=[MinValueValidator(0)])
    reserved_capacity = models.IntegerField(validators=[MinValueValidator(0)])
    is_closed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory"
        indexes = [
            models.Index(fields=["experience"], name="idx_inventory_experience"),
            models.Index(fields=["inventory_date"], name="idx_inventory_date"),
            models.Index(fields=["is_closed"], name="idx_inventory_is_closed"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["experience", "inventory_date"],
                name="uq_experience_inventory_date"
            )
        ]

    def clean(self):
        super().clean()
        if self.total_capacity < 0:
            raise ValidationError("Total capacity cannot be negative.")
        if self.available_capacity < 0:
            raise ValidationError("Available capacity cannot be negative.")
        if self.reserved_capacity < 0:
            raise ValidationError("Reserved capacity cannot be negative.")
        if self.available_capacity > self.total_capacity:
            raise ValidationError("Available capacity cannot exceed total capacity.")
        if self.reserved_capacity > self.total_capacity:
            raise ValidationError("Reserved capacity cannot exceed total capacity.")

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Inventory.objects.filter(public_id=f"inv-{random_id}").exists():
                    self.public_id = f"inv-{random_id}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.experience.name} - {self.inventory_date} ({self.available_capacity}/{self.total_capacity})"
