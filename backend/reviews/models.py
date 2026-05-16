from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from user.models import User_Data
from content.models import Experience
from booking.models import Booking


class Review(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(
        User_Data, on_delete=models.CASCADE, related_name="reviews", db_index=True
    )
    experience_id = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="reviews", db_index=True
    )

    # booking_id = models.ForeignKey(
    #     Booking,
    #     on_delete=models.SET_NULL,
    #     to_field="booking_reference",
    #     related_name="reviews",
    #     blank=True,
    #     null=True,
    #     db_index=True,
    #     help_text="Ensure they visited",
    # )

    rating = models.IntegerField(
        null=False,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5 stars",
    )
    review_text = models.TextField(blank=True, null=True)
    helpful_count = models.IntegerField(default=0)

    #is_verified_purchase = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True, help_text="Soft delete")

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at", "updated_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def __str__(self):
        return f"Review {self.id} - {self.user_id} on {self.experience_id} ({self.rating}★)"

    class Meta:
        db_table = "reviews"
        indexes = [
            models.Index(fields=["experience_id"], name="idx_reviews_experience_id"),
            models.Index(fields=["user_id"], name="idx_reviews_user_id"),
            models.Index(
                fields=["experience_id", "created_at"],
                name="idx_rev_exp_created_at",
            ),
            models.Index(fields=["rating"], name="idx_reviews_rating"),
        ]
