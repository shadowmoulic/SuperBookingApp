from rest_framework import serializers
from content import models as ContentModel
from booking import models as BookingModel
from user.models import User_Data

# from django.contrib.auth.models import User as AuthUser
from .paginations import StandardResultsSetPagination
from reviews.models import Review as ReviewModel


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        if obj.user_id and obj.user_id.user:
            return obj.user_id.user.get_full_name() or obj.user_id.user.username
        return "Anonymous"

    def create(self, validated_data):
        request = self.context.get("request")
        if request is None:  # or not request.user.is_authenticated
            raise serializers.ValidationError(
                "Authentication required to create review."
            )

        validated_data["user_id"] = request.user.user_data
        return super().create(validated_data)

    class Meta:
        model = ReviewModel
        fields = [
            "id",
            "user_name",
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
            "user_name",
            "user_id",
            "helpful_count",
            "created_at",
            "updated_at",
            "deleted_at",
        ]


class ExperienceSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Experience
        fields = [
            "public_id",
            "name",
            "description",
            "category",
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
            "average_rating",
            "total_reviews",
            "reviews",
            "created_at",
            "updated_at",
            "deleted_at",
        ]

    def get_category(self, obj):
        return obj.category.name

    def get_location(self, obj):
        return obj.location.name

    def get_average_rating(self, obj):
        # Use annotated average_rating if available (from queryset annotation)
        if hasattr(obj, "average_rating") and obj.average_rating is not None:
            return round(float(obj.average_rating), 2)
        return None

    def get_total_reviews(self, obj):
        # Use annotated total_reviews if available (from queryset annotation)
        if hasattr(obj, "total_reviews"):
            return obj.total_reviews
        return 0

    def get_reviews(self, obj):
        reviews = obj.reviews.filter(deleted_at__isnull=True).order_by("-created_at")
        request = self.context.get("request")

        # Initialize paginator with specific page size
        paginator = StandardResultsSetPagination()
        paginator.page_size = 10

        if request:
            paginated_reviews = paginator.paginate_queryset(reviews, request)
            if paginated_reviews is not None:
                serializer = ReviewSerializer(
                    paginated_reviews, many=True, context={"request": request}
                )
                return paginator.get_paginated_response(serializer.data).data

        return ReviewSerializer(reviews[:10], many=True).data


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.State
        fields = [
            "public_id",
            "name",
        ]


class CitySerializer(serializers.ModelSerializer):
    state = serializers.CharField(source="state.name", default=None, read_only=True)

    class Meta:
        model = ContentModel.City
        fields = [
            "public_id",
            "name",
            "state",
            "icon_url",
        ]


class ExperienceShortSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Experience
        fields = [
            "public_id",
            "name",
            "category",
            "location",
            "image_url",
            "entry_fee_base",
            "is_open",
            "average_rating",
            "total_reviews",
            "latitude",
            "longitude",
        ]

    def get_category(self, obj):
        return obj.category.name

    def get_location(self, obj):
        return obj.location.name

    def get_average_rating(self, obj):
        # Use annotated average_rating if available (from queryset annotation)
        if hasattr(obj, "average_rating") and obj.average_rating is not None:
            return round(float(obj.average_rating), 2)
        return None

    def get_total_reviews(self, obj):
        # Use annotated total_reviews if available (from queryset annotation)
        if hasattr(obj, "total_reviews"):
            return obj.total_reviews
        return 0


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
    experience_id = serializers.CharField(
        source="experience.public_id", read_only=True
    )
    experience_name = serializers.CharField(
        source="experience.name", read_only=True
    )
    experience_image = serializers.CharField(
        source="experience.image_url", read_only=True
    )

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
            "user_id",
            "experience_id",
            "experience_name",
            "experience_image",
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
            "reference",
            "created_at",
            "updated_at",
            "cancelled_at",
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """For POST requests - minimal required fields"""

    experience = serializers.SlugRelatedField(
        slug_field="public_id", queryset=ContentModel.Experience.objects.all()
    )

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
            "experience",
            "booking_date",
            "slot_time",
            "total_tickets",
            "special_requests",
        ]
        read_only_fields = ["reference"]

    def create(self, validated_data):
        request = self.context.get("request")
        experience = validated_data["experience"]
        tickets = validated_data["total_tickets"]
        user = request.user

        try:
            user_data = User_Data.objects.get(user=user)
        except User_Data.DoesNotExist:
            raise serializers.ValidationError(
                "User profile not found. Please complete your profile setup."
            )

        validated_data["user"] = user_data
        validated_data["total_amount"] = experience.entry_fee_base * tickets
        return BookingModel.Booking.objects.create(**validated_data)


class BookingDetailSerializer(serializers.ModelSerializer):
    """For GET requests - includes related object details"""

    user = serializers.StringRelatedField(read_only=True)
    experience = ExperienceShortSerializer(read_only=True)

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
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
    booking = serializers.SlugRelatedField(
        slug_field="reference", queryset=BookingModel.Booking.objects.all()
    )

    class Meta:
        model = BookingModel.Payment
        fields = [
            "booking",
            "payment_method",
            "payment_gateway",
        ]

    def validate_booking(self, booking):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            if booking.user.user != request.user:
                raise serializers.ValidationError(
                    "You do not have permission to create a payment for this booking."
                )
        if booking.status == "cancelled":
            raise serializers.ValidationError(
                "Cannot create payment for cancelled booking."
            )
        return booking

    def create(self, validated_data):
        request = self.context.get("request")
        booking = validated_data["booking"]
        user = request.user

        try:
            user_data = User_Data.objects.get(user=user)
        except User_Data.DoesNotExist:
            raise serializers.ValidationError(
                "User profile not found. Please complete your profile setup."
            )

        validated_data["user"] = user_data
        validated_data["amount"] = booking.total_amount
        validated_data["status"] = "pending"

        return BookingModel.Payment.objects.create(**validated_data)


class TicketSerializer(serializers.ModelSerializer):
    qr_image = serializers.SerializerMethodField()
    booking_reference = serializers.CharField(
        source="booking.reference", read_only=True
    )
    booking_date = serializers.DateField(source="booking.booking_date", read_only=True)
    slot_time = serializers.TimeField(source="booking.slot_time", read_only=True)
    total_tickets = serializers.IntegerField(
        source="booking.total_tickets", read_only=True
    )
    total_amount = serializers.DecimalField(
        source="booking.total_amount", max_digits=10, decimal_places=2, read_only=True
    )
    status = serializers.CharField(source="booking.status", read_only=True)
    experience_id = serializers.CharField(
        source="booking.experience.public_id", read_only=True
    )
    experience_name = serializers.CharField(
        source="booking.experience.name", read_only=True
    )
    experience_image = serializers.CharField(
        source="booking.experience.image_url", read_only=True
    )

    class Meta:
        model = BookingModel.Ticket
        fields = [
            "id",
            "qr_code",
            "qr_image",
            "booking_reference",
            "booking_date",
            "slot_time",
            "total_tickets",
            "total_amount",
            "status",
            "experience_id",
            "experience_name",
            "experience_image",
        ]

    def get_qr_image(self, obj):
        return obj.get_qr_code_image_base64()


class UserDataRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False, default="")
    first_name = serializers.CharField(write_only=True, required=False, default="")
    last_name = serializers.CharField(write_only=True, required=False, default="")

    class Meta:
        model = User_Data
        fields = [
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "mobile",
            "role",
        ]

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
