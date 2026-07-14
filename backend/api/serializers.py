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


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.Provider
        fields = [
            "public_id",
            "name",
            "description",
            "contact_email",
            "contact_phone",
            "website_url",
            "is_active",
        ]


class PricingRuleSerializer(serializers.ModelSerializer):
    final_price = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.PricingRule
        fields = [
            "id",
            "base_price",
            "seasonal_multiplier",
            "valid_from",
            "valid_to",
            "final_price",
            "is_active",
        ]

    def get_final_price(self, obj):
        return obj.get_final_price()

    def get_is_active(self, obj):
        return obj.is_active()



class TicketTypeSerializer(serializers.ModelSerializer):
    pricing_rules = PricingRuleSerializer(many=True, read_only=True)
    schedules = serializers.SerializerMethodField()
    booking_policy = serializers.SerializerMethodField()
    ticket_features = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.TicketType
        fields = [
            "public_id",
            "name",
            "description",
            "is_active",
            "pricing_rules",
            "booking_policy",
            "ticket_features",
            "schedules",
        ]

    def get_schedules(self, obj):
        schedules = []
        operating_hours = obj.experience.operating_hours.filter(is_closed=False)

        if operating_hours.exists():
            for oh in operating_hours.order_by("day_of_week"):
                schedules.append({
                    "id": None,
                    "recurrence_type": "weekly",
                    "specific_date": None,
                    "day_of_week": oh.day_of_week,
                    "start_date": None,
                    "end_date": None,
                    "start_time": oh.opens_at.isoformat() if oh.opens_at else None,
                    "end_time": oh.closes_at.isoformat() if oh.closes_at else None,
                    "capacity": obj.experience.max_daily_capacity or 0,
                    "available_capacity": obj.experience.max_daily_capacity or 0,
                    "is_active": True,
                })
        elif obj.experience.opening_time and obj.experience.closing_time:
            schedules.append({
                "id": None,
                "recurrence_type": "daily",
                "specific_date": None,
                "day_of_week": None,
                "start_date": None,
                "end_date": None,
                "start_time": obj.experience.opening_time.isoformat(),
                "end_time": obj.experience.closing_time.isoformat(),
                "capacity": obj.experience.max_daily_capacity or 0,
                "available_capacity": obj.experience.max_daily_capacity or 0,
                "is_active": True,
            })
        return schedules

    def get_booking_policy(self, obj):
        return {
            "instant_confirmation": True,
            "requires_manual_confirmation": False,
            "cancellation_allowed": True,
            "cancellation_before_hours": 24,
            "refund_allowed": True,
            "validity_type": "fixed",
            "validity_duration": None,
            "slot_booking_required": False,
            "qr_reusable": False,
        }

    def get_ticket_features(self, obj):
        return []


class ExperienceSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()
    attributes = serializers.SerializerMethodField()
    provider = ProviderSerializer(read_only=True)
    ticket_types = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Experience
        fields = [
            "public_id",
            "name",
            "slug",
            "subtitle",
            "description",
            "address",
            "category",
            "city",
            "provider",
            "ticket_types",
            "highlights",
            "attributes",
            "latitude",
            "longitude",
            "image_url",
            "max_daily_capacity",
            "entry_fee_base",
            "is_open",
            "opening_time",
            "closing_time",
            "time_required",
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

    def get_city(self, obj):
        return obj.city.name if obj.city else None

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

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

    def get_ticket_types(self, obj):
        active_ticket_types = obj.ticket_types.filter(deleted_at__isnull=True, is_active=True)
        if active_ticket_types.exists():
            return TicketTypeSerializer(active_ticket_types, many=True, context=self.context).data

        fallback_price = float(obj.entry_fee_base) if obj.entry_fee_base is not None else 0.0
        schedule = None
        if obj.opening_time and obj.closing_time:
            schedule = {
                "id": None,
                "recurrence_type": "daily",
                "specific_date": None,
                "day_of_week": None,
                "start_date": None,
                "end_date": None,
                "start_time": obj.opening_time.isoformat(),
                "end_time": obj.closing_time.isoformat(),
                "capacity": obj.max_daily_capacity or 0,
                "available_capacity": obj.max_daily_capacity or 0,
                "is_active": True,
            }

        return [
            {
                "public_id": f"tt-fallback-{obj.public_id}",
                "name": "General Admission",
                "description": obj.description or "General admission ticket",
                "is_active": bool(obj.is_open),
                "pricing_rules": [
                    {
                        "id": None,
                        "base_price": str(obj.entry_fee_base or "0.00"),
                        "seasonal_multiplier": "1.00",
                        "valid_from": None,
                        "valid_to": None,
                        "final_price": fallback_price,
                        "is_active": True,
                    }
                ],
                "booking_policy": {
                    "instant_confirmation": True,
                    "requires_manual_confirmation": False,
                    "cancellation_allowed": True,
                    "cancellation_before_hours": 24,
                    "refund_allowed": True,
                    "validity_type": "fixed",
                    "validity_duration": None,
                    "slot_booking_required": False,
                    "qr_reusable": False,
                },
                "ticket_features": [],
                "schedules": [schedule] if schedule else [],
            }
        ]

    def get_highlights(self, obj):
        return []

    def get_attributes(self, obj):
        return []

class ExperienceShortSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    provider = ProviderSerializer(read_only=True)

    class Meta:
        model = ContentModel.Experience
        fields = [
            "public_id",
            "name",
            "slug",
            "address",
            "category",
            "city",
            "provider",
            "image_url",
            "entry_fee_base",
            "is_open",
            "average_rating",
            "total_reviews",
            "time_required",
        ]

    def get_category(self, obj):
        return obj.category.name

    def get_city(self, obj):
        return obj.city.name if obj.city else None

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

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

class StateSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()
    city_count = serializers.SerializerMethodField()
    experience_count = serializers.SerializerMethodField()
    cities = serializers.SerializerMethodField()
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.State
        fields = [
            "public_id",
            "name",
            "slug",
            "description",
            "image_url",
            "best_time",
            "seo_title",
            "seo_description",
            "website",
            "city_count",
            "experience_count",
            "cities",
            "experiences",
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_city_count(self, obj):
        if hasattr(obj, "city_count"):
            return obj.city_count
        return obj.cities.count()

    def get_experience_count(self, obj):
        if hasattr(obj, "experience_count"):
            return obj.experience_count
        return ContentModel.Experience.objects.filter(city__state=obj, deleted_at__isnull=True).count()

    def get_cities(self, obj):
        cities = obj.cities.select_related("state").all().order_by("id")

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the cities
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginator.page_query_param = "cities_page"
            paginated_cities = paginator.paginate_queryset(cities, request)
            serializer = CityShortSerializer(paginated_cities, many=True, context=self.context)
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 cities
        cities = cities[:10]
        return CityShortSerializer(cities, many=True, context=self.context).data

    def get_experiences(self, obj):
        experiences = ContentModel.Experience.objects.filter(
            city__state=obj, deleted_at__isnull=True
        ).select_related("category", "city", "provider").order_by("id")

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginator.page_query_param = "experiences_page"
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(paginated_experiences, many=True, context=self.context)
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(experiences, many=True, context=self.context).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "best_time" in data:
            data["best-time"] = data.pop("best_time")
        if "seo_title" in data:
            data["SEO-title"] = data.pop("seo_title")
        if "seo_description" in data:
            data["SEO-description"] = data.pop("seo_description")
        return data


class StateShortSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()
    city_count = serializers.SerializerMethodField()
    experience_count = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.State
        fields = [
            "public_id",
            "name",
            "slug",
            "description",
            "image_url",
            "best_time",
            "city_count",
            "experience_count",
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_city_count(self, obj):
        if hasattr(obj, "city_count"):
            return obj.city_count
        return obj.cities.count()

    def get_experience_count(self, obj):
        if hasattr(obj, "experience_count"):
            return obj.experience_count
        return ContentModel.Experience.objects.filter(city__state=obj, deleted_at__isnull=True).count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "best_time" in data:
            data["best-time"] = data.pop("best_time")
        return data


class CitySerializer(serializers.ModelSerializer):
    state = serializers.CharField(source="state.name", default=None, read_only=True)
    slug = serializers.SerializerMethodField()
    experience_count = serializers.SerializerMethodField()
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.City
        fields = [
            "public_id",
            "name",
            "slug",
            "description",
            "state",
            "icon_url",
            "image_url",
            "best_time",
            "seo_title",
            "seo_description",
            "latitude",
            "longitude",
            "experience_count",
            "experiences",
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_experience_count(self, obj):
        if hasattr(obj, "experience_count"):
            return obj.experience_count
        return obj.experiences.filter(deleted_at__isnull=True).count()
    
    def get_experiences(self, obj):
        experiences = obj.experiences.select_related("category", "city", "provider").filter(deleted_at__isnull=True).order_by("id")

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginator.page_query_param = "experiences_page"
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(paginated_experiences, many=True, context=self.context)
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(experiences, many=True, context=self.context).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "best_time" in data:
            data["best-time"] = data.pop("best_time")
        if "seo_title" in data:
            data["SEO-title"] = data.pop("seo_title")
        if "seo_description" in data:
            data["SEO-description"] = data.pop("seo_description")
        return data


class CityShortSerializer(serializers.ModelSerializer):
    state = serializers.CharField(source="state.name", default=None, read_only=True)
    slug = serializers.SerializerMethodField()
    experience_count = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.City
        fields = [
            "public_id",
            "name",
            "slug",
            "description",
            "state",
            "icon_url",
            "image_url",
            "best_time",
            "experience_count",
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_experience_count(self, obj):
        if hasattr(obj, "experience_count"):
            return obj.experience_count
        return obj.experiences.filter(deleted_at__isnull=True).count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "best_time" in data:
            data["best-time"] = data.pop("best_time")
        return data


class CategorySerializer(serializers.ModelSerializer):
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Category
        fields = [
            "id",
            "name",
            "description",
            "icon_url",
            "image_url",
            "seo_title",
            "seo_description",
            "experiences",
        ]

    def get_experiences(self, obj):
        experiences = obj.experiences.select_related("category", "city", "provider").filter(deleted_at__isnull=True).order_by("id")

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(paginated_experiences, many=True, context=self.context)
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(experiences, many=True, context=self.context).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "seo_title" in data:
            data["SEO-title"] = data.pop("seo_title")
        if "seo_description" in data:
            data["SEO-description"] = data.pop("seo_description")
        return data


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


class InventorySerializer(serializers.ModelSerializer):
    experience = serializers.SlugRelatedField(
        slug_field="public_id", read_only=True
    )

    class Meta:
        model = BookingModel.Inventory
        fields = [
            "public_id",
            "experience",
            "inventory_date",
            "total_capacity",
            "available_capacity",
            "reserved_capacity",
            "is_closed",
        ]


class CollectionExperienceSerializer(serializers.ModelSerializer):
    experience = ExperienceShortSerializer(read_only=True)

    class Meta:
        model = ContentModel.CollectionExperience
        fields = [
            "display_order",
            "experience",
        ]


class CollectionSerializer(serializers.ModelSerializer):
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Collection
        fields = [
            "public_id",
            "name",
            "description",
            "collection_type",
            "image_url",
            "is_active",
            "experiences",
        ]

    def get_experiences(self, obj):
        relations = obj.collection_experiences.select_related(
            "experience", "experience__category", "experience__city"
        ).order_by("display_order")
        active_relations = [r for r in relations if r.experience.deleted_at is None]
        return CollectionExperienceSerializer(active_relations, many=True).data
