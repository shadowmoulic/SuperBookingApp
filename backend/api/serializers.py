from rest_framework import serializers
from content import models as ContentModel
from booking import models as BookingModel
from user.models import User_Data
# from django.contrib.auth.models import User as AuthUser
from .paginations import StandardResultsSetPagination
import uuid
from reviews.models import Review as ReviewModel



class ReviewSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        request = self.context.get("request")
        if request is None:#or not request.user.is_authenticated
            raise serializers.ValidationError("Authentication required to create review.")

        validated_data["user_id"] = request.user.user_data
        return super().create(validated_data)

    class Meta:
        model = ReviewModel
        fields = [
            "id",
            "user_id",
            "experience_id",
            "rating",
            "review_text",
            "helpful_count",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "helpful_count",
            "created_at",
            "updated_at",
            "deleted_at",
        ]



class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.Experience
        fields = [
            "id",
            "name",
            "description",
            "category_id",
            "location",
            "latitude",
            "longitude",
            "image_url",
            "max_daily_capacity",
            "entry_fee_base",
            "is_open",
            "opening_time",
            "closing_time",
            "last_entry_time",
            "created_at",
            "updated_at",
            "deleted_at",
        ]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.Location
        fields = [
            "id",
            "name",
            "icon_url",
        ]


class ExperienceShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.Experience
        fields = [
            "id",
            "name",
            "category_id",
            "location",
            "image_url",
            "entry_fee_base",
            "is_open",
        ]


class CategorySerializer(serializers.ModelSerializer):
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Category
        fields = ["id", "name", "description", "icon_url", "experiences"]

    def get_experiences(self, obj):
        experiences = obj.experiences.filter(deleted_at__isnull=True).order_by("id")

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(paginated_experiences, many=True)
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(experiences, many=True).data




class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingModel.Booking
        fields = [
            "booking_reference",
            "user_id",
            "experience_id",
            "booking_date",
            "slot_time",
            "total_tickets",
            "total_amount",
            "status",
            "cancelled_at",
            "cancellation_reason",
            "refund_amount",
            "refund_status",
            "special_requests",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = [
            "booking_reference",
            "created_at",
            "updated_at",
            "cancelled_at",
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """For POST requests - minimal required fields"""
    user_id = serializers.PrimaryKeyRelatedField(queryset=User_Data.objects.all())

    class Meta:
        model = BookingModel.Booking
        fields = [
            "user_id",
            "experience_id",
            "booking_date",
            "slot_time",
            "total_tickets",
            # "total_amount",
            "special_requests",
        ]

    # def validate_user_id(self, auth_user):
    #     try:
    #         return auth_user.user
    #     except User_Data.DoesNotExist:
    #         raise serializers.ValidationError("No profile found for this user.")

    def create(self, validated_data):
        experience = validated_data["experience_id"]
        tickets = validated_data["total_tickets"]
        validated_data["total_amount"] = experience.entry_fee_base * tickets
        return BookingModel.Booking.objects.create(**validated_data)


class BookingDetailSerializer(serializers.ModelSerializer):
    """For GET requests - includes related object details"""

    user = serializers.StringRelatedField(source="user_id", read_only=True)
    experience = ExperienceShortSerializer(source="experience_id", read_only=True)

    class Meta:
        model = BookingModel.Booking
        fields = [
            "booking_reference",
            "user",
            "experience",
            "booking_date",
            "slot_time",
            "total_tickets",
            "total_amount",
            "status",
            "refund_status",
            "special_requests",
            "created_at",
            "updated_at",
        ]


class CreatePaymentSerializer(serializers.ModelSerializer):
    booking_reference = serializers.PrimaryKeyRelatedField(
        queryset=BookingModel.Booking.objects.all()
    )  # get all the booking_refences

    class Meta:
        model = BookingModel.Payment
        fields = [
            "booking_reference",
            "payment_method",
            "payment_gateway",
        ]

    def validate_booking_reference(self, booking):
        if booking.status == "cancelled":
            raise serializers.ValidationError("Cannot create payment for cancelled booking.")
        return booking

    def create(self, validated_data):
        booking = validated_data["booking_reference"]
        payment, created = BookingModel.Payment.objects.get_or_create(
            booking_reference=booking,
            defaults={
                "payment_reference": f"PAY-{uuid.uuid4().hex[:14].upper()}",
                "user_id": booking.user_id,
                "amount": booking.total_amount,
                "status": "pending",
                **{k: v for k, v in validated_data.items() if k != "booking_reference"},
            },
        )
        return payment


class UserDataRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False, default="")
    first_name = serializers.CharField(write_only=True, required=False, default="")
    last_name = serializers.CharField(write_only=True, required=False, default="")

    class Meta:
        model = User_Data
        fields = ["username", "password", "email", "first_name", "last_name", "mobile", "role"]

    def create(self, validated_data):
        from django.contrib.auth.models import User as AuthUser
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data.pop("email", "")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")

        auth_user = AuthUser.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        # get_or_create handles the signal that may have already created User_Data
        profile, _ = User_Data.objects.get_or_create(
            user=auth_user,
            defaults=validated_data,
        )
        for attr, value in validated_data.items():
            setattr(profile, attr, value)
        profile.save()
        return profile