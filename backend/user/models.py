from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class User_Data(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    NOTIFICATION_CHOICES = [
        ("email", "Email"),
        ("sms", "SMS"),
        ("push", "Push"),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="user_data", default=0
    )
    mobile = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=False)
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    profile_picture_url = models.CharField(max_length=500, blank=True, null=True)
    preferred_notification = models.CharField(
        max_length=20, choices=NOTIFICATION_CHOICES, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.user.email})"

    class Meta:
        db_table = "users"


@receiver(post_save, sender=User)
def create_user_data(sender, instance, created, **kwargs):
    if created:
        User_Data.objects.create(user=instance, role="user")


@receiver(post_save, sender=User)
def save_user_data(sender, instance, **kwargs):
    instance.user_data.save()


class Enterprise(models.Model):
    ORG_TYPES = [
        ("travel_agency", "Travel Agency"),
        ("school", "School"),
        ("college", "College"),
        ("corporate", "Corporate"),
        ("government", "Government"),
        ("ngo", "NGO"),
        ("tour_operator", "Tour Operator"),
        ("other", "Other"),
    ]

    VERIFICATION_STATUSES = [
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    ]

    public_id = models.CharField(
        max_length=15, unique=True, blank=True, editable=False
    )
    organization_name = models.CharField(max_length=255)
    organization_type = models.CharField(
        max_length=50, choices=ORG_TYPES, default="other"
    )
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    contact_person = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=50)
    website = models.URLField(max_length=500, blank=True, null=True)
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUSES, default="pending"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "enterprises"

    def save(self, *args, **kwargs):
        from content.models import generate_random_id

        if not self.public_id:
            while True:
                random_id = generate_random_id()
                if not Enterprise.objects.filter(
                    public_id=f"ent-{random_id}"
                ).exists():
                    self.public_id = f"ent-{random_id}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.organization_name} ({self.public_id})"


class EnterpriseMember(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("booking_manager", "Booking Manager"),
        ("finance", "Finance"),
        ("viewer", "Viewer"),
    ]

    enterprise = models.ForeignKey(
        Enterprise, on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="enterprise_memberships"
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="viewer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "enterprise_members"
        unique_together = [("enterprise", "user")]

    def __str__(self):
        return f"{self.user} - {self.role} in {self.enterprise.organization_name}"


class ProviderMember(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("staff", "Staff"),
        ("viewer", "Viewer"),
    ]

    provider = models.ForeignKey(
        "content.Provider", on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="provider_memberships"
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="staff")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "provider_members"
        unique_together = [("provider", "user")]

    def __str__(self):
        return f"{self.user} - {self.role} in {self.provider.name}"

