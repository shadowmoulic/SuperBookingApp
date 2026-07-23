from decimal import Decimal
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from content import models as ContentModel
from booking import models as BookingModel
from user.models import User_Data, Enterprise, EnterpriseMember

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
            "price",
            "nationality_category",
            "age_category",
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


class BookingPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.BookingPolicy
        fields = [
            "instant_confirmation",
            "requires_manual_confirmation",
            "cancellation_allowed",
            "cancellation_before_hours",
            "refund_allowed",
            "validity_type",
            "validity_duration",
            "slot_booking_required",
            "qr_reusable",
        ]


class TicketFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.TicketFeature
        fields = [
            "feature_type",
            "title",
            "description",
            "display_order",
        ]


class OperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.OperatingHours
        fields = [
            "opening_time",
            "closing_time",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]


class OperatingExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.OperatingException
        fields = [
            "id",
            "date",
            "is_closed",
            "opening_time",
            "closing_time",
            "reason",
            "created_at",
            "updated_at",
        ]


class ScheduleSerializer(serializers.ModelSerializer):
    experience_name = serializers.CharField(source="experience.name", read_only=True)
    experience_public_id = serializers.CharField(
        source="experience.public_id", read_only=True
    )

    class Meta:
        model = BookingModel.Schedule
        fields = [
            "id",
            "experience",
            "experience_name",
            "experience_public_id",
            "recurrence_type",
            "specific_date",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "start_date",
            "end_date",
            "start_time",
            "end_time",
            "capacity",
            "available_capacity",
            "is_active",
        ]


class TicketTypeScheduleSerializer(serializers.ModelSerializer):
    schedule_start_time = serializers.TimeField(
        source="schedule.start_time", read_only=True
    )
    schedule_end_time = serializers.TimeField(
        source="schedule.end_time", read_only=True
    )
    recurrence_type = serializers.CharField(
        source="schedule.recurrence_type", read_only=True
    )
    specific_date = serializers.DateField(
        source="schedule.specific_date", read_only=True
    )
    monday = serializers.BooleanField(source="schedule.monday", read_only=True)
    tuesday = serializers.BooleanField(source="schedule.tuesday", read_only=True)
    wednesday = serializers.BooleanField(source="schedule.wednesday", read_only=True)
    thursday = serializers.BooleanField(source="schedule.thursday", read_only=True)
    friday = serializers.BooleanField(source="schedule.friday", read_only=True)
    saturday = serializers.BooleanField(source="schedule.saturday", read_only=True)
    sunday = serializers.BooleanField(source="schedule.sunday", read_only=True)

    class Meta:
        model = BookingModel.TicketTypeSchedule
        fields = [
            "public_id",
            "schedule",
            "schedule_start_time",
            "schedule_end_time",
            "recurrence_type",
            "specific_date",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ExperienceHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.ExperienceHighlight
        fields = [
            "title",
            "icon",
            "display_order",
        ]


class ExperienceAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.ExperienceAttribute
        fields = [
            "key",
            "value",
            "display_order",
        ]


class TicketTypeSerializer(serializers.ModelSerializer):
    pricing_rules = PricingRuleSerializer(many=True, read_only=True)
    schedules = TicketTypeScheduleSerializer(
        source="ticket_type_schedules", many=True, read_only=True
    )
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

    def get_booking_policy(self, obj):
        policy = ContentModel.BookingPolicy.objects.filter(ticket_type=obj).first()
        if policy:
            return BookingPolicySerializer(policy).data
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
        features = ContentModel.TicketFeature.objects.filter(ticket_type=obj)
        if features.exists():
            return TicketFeatureSerializer(features, many=True).data
        return []


class ExperienceSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    provider = ProviderSerializer(read_only=True)
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    highlights = ExperienceHighlightSerializer(many=True, read_only=True)
    attributes = ExperienceAttributeSerializer(many=True, read_only=True)
    operating_hours = OperatingHoursSerializer(read_only=True)
    operating_exceptions = OperatingExceptionSerializer(many=True, read_only=True)

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
            "operating_hours",
            "operating_exceptions",
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
        active_ticket_types = obj.ticket_types.filter(
            deleted_at__isnull=True, is_active=True
        )
        if active_ticket_types.exists():
            return TicketTypeSerializer(
                active_ticket_types, many=True, context=self.context
            ).data

        fallback_price = (
            float(obj.entry_fee_base) if obj.entry_fee_base is not None else 0.0
        )
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
                        "price": str(obj.entry_fee_base or "0.00"),
                        "nationality_category": "Indian",
                        "age_category": "Adult",
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
        return ContentModel.Experience.objects.filter(
            city__state=obj, deleted_at__isnull=True
        ).count()

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
            serializer = CityShortSerializer(
                paginated_cities, many=True, context=self.context
            )
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 cities
        cities = cities[:10]
        return CityShortSerializer(cities, many=True, context=self.context).data

    def get_experiences(self, obj):
        experiences = (
            ContentModel.Experience.objects.filter(
                city__state=obj, deleted_at__isnull=True
            )
            .select_related("category", "city", "provider")
            .order_by("id")
        )

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginator.page_query_param = "experiences_page"
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(
                paginated_experiences, many=True, context=self.context
            )
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(
            experiences, many=True, context=self.context
        ).data

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
        return ContentModel.Experience.objects.filter(
            city__state=obj, deleted_at__isnull=True
        ).count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "best_time" in data:
            data["best-time"] = data.pop("best_time")
        return data


class CityNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentModel.City
        fields = ["name"]


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
        experiences = (
            obj.experiences.select_related("category", "city", "provider")
            .filter(deleted_at__isnull=True)
            .order_by("id")
        )

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginator.page_query_param = "experiences_page"
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(
                paginated_experiences, many=True, context=self.context
            )
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(
            experiences, many=True, context=self.context
        ).data

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
    slug = serializers.SerializerMethodField()
    experiences = serializers.SerializerMethodField()

    class Meta:
        model = ContentModel.Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon_url",
            "image_url",
            "seo_title",
            "seo_description",
            "experiences",
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify

        return slugify(obj.name)

    def get_experiences(self, obj):
        experiences = (
            obj.experiences.select_related("category", "city", "provider")
            .filter(deleted_at__isnull=True)
            .order_by("id")
        )

        # Get the request from the context
        request = self.context.get("request")

        # If there is a request, paginate the experiences
        if request:
            paginator = StandardResultsSetPagination()
            paginator.page_size = 10
            paginated_experiences = paginator.paginate_queryset(experiences, request)
            serializer = ExperienceShortSerializer(
                paginated_experiences, many=True, context=self.context
            )
            return paginator.get_paginated_response(serializer.data).data

        # If there is no request, return the first 10 experiences
        experiences = experiences[:10]
        return ExperienceShortSerializer(
            experiences, many=True, context=self.context
        ).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if "seo_title" in data:
            data["SEO-title"] = data.pop("seo_title")
        if "seo_description" in data:
            data["SEO-description"] = data.pop("seo_description")
        return data


class BookingItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_type_public_id = serializers.CharField(
        source="ticket_type.public_id", read_only=True
    )
    time_slot_public_id = serializers.CharField(
        source="time_slot.public_id", read_only=True
    )

    class Meta:
        model = BookingModel.BookingItem
        fields = [
            "id",
            "ticket_type",
            "ticket_type_name",
            "ticket_type_public_id",
            "time_slot",
            "time_slot_public_id",
            "quantity",
            "unit_price",
            "subtotal",
            "nationality_category",
            "age_category",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["subtotal", "created_at", "updated_at"]


class BookingSerializer(serializers.ModelSerializer):
    experience_id = serializers.CharField(source="experience.public_id", read_only=True)
    experience_name = serializers.CharField(source="experience.name", read_only=True)
    experience_image = serializers.CharField(
        source="experience.image_url", read_only=True
    )
    items = BookingItemSerializer(many=True, read_only=True)

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
            "user_id",
            "experience_id",
            "experience_name",
            "experience_image",
            "booking_date",
            "total_tickets",
            "total_amount",
            "status",
            "cancelled_at",
            "cancellation_reason",
            "refund_amount",
            "refund_status",
            "special_requests",
            "items",
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


class BookingItemCreateSerializer(serializers.Serializer):
    ticket_type = serializers.SlugRelatedField(
        slug_field="public_id", queryset=ContentModel.TicketType.objects.all()
    )
    time_slot = serializers.SlugRelatedField(
        slug_field="public_id",
        queryset=BookingModel.TicketTypeSchedule.objects.all(),
        required=False,
        allow_null=True,
    )
    quantity = serializers.IntegerField(min_value=1, default=1)
    unit_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    nationality_category = serializers.ChoiceField(
        choices=ContentModel.PricingRule.NATIONALITY_CHOICES,
        required=False,
        allow_blank=False,
        allow_null=False,
        default="Any",
    )
    age_category = serializers.ChoiceField(
        choices=ContentModel.PricingRule.AGE_CHOICES,
        required=False,
        allow_blank=False,
        allow_null=False,
        default="Any",
    )


class BookingCreateSerializer(serializers.ModelSerializer):
    experience = serializers.SlugRelatedField(
        slug_field="public_id", queryset=ContentModel.Experience.objects.all()
    )
    items = BookingItemCreateSerializer(many=True, required=True, write_only=True)

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
            "experience",
            "booking_date",
            "items",
            "total_tickets",
            "special_requests",
        ]
        read_only_fields = ["reference"]
        extra_kwargs = {"total_tickets": {"required": False}}

    def validate(self, attrs):
        experience = attrs.get("experience")
        booking_date = attrs.get("booking_date")
        items = attrs.get("items")

        # 1. Experience Check
        if not experience or (hasattr(experience, "is_open") and not experience.is_open):
            raise serializers.ValidationError(
                {"experience": f"Experience '{experience.name if experience else 'Unknown'}' is currently closed/unavailable."}
            )

        date_to_check = booking_date or timezone.now().date()

        # 2. OperatingHours Check (General Venue Operating Calendar)
        if hasattr(experience, "operating_hours") and experience.operating_hours:
            oh = experience.operating_hours
            if not oh.is_open_on_date(date_to_check):
                raise serializers.ValidationError(
                    {"booking_date": f"Experience is not operating on {date_to_check.strftime('%A')}."}
                )

        # 3. OperatingException Check (Date-Specific Overrides)
        op_exception = ContentModel.OperatingException.objects.filter(
            experience=experience, date=date_to_check
        ).first()

        effective_opening = None
        effective_closing = None
        if op_exception:
            if op_exception.is_closed:
                reason_msg = f" ({op_exception.reason})" if op_exception.reason else ""
                raise serializers.ValidationError(
                    {"booking_date": f"Experience is closed on {date_to_check}{reason_msg}."}
                )
            effective_opening = op_exception.opening_time
            effective_closing = op_exception.closing_time
        elif hasattr(experience, "operating_hours") and experience.operating_hours:
            effective_opening = experience.operating_hours.opening_time
            effective_closing = experience.operating_hours.closing_time

        # 4. Items Presence Check
        if not items:
            raise serializers.ValidationError(
                {"items": "At least one booking item is required."}
            )

        for item in items:
            tt = item.get("ticket_type")
            ts = item.get("time_slot")
            qty = item.get("quantity", 1)

            # Ticket Type Validation
            if not tt:
                raise serializers.ValidationError(
                    {"items": "Each booking item must have a ticket_type."}
                )
            if hasattr(tt, "is_active") and not tt.is_active:
                raise serializers.ValidationError(
                    {"items": f"Ticket type '{tt.name}' is currently inactive."}
                )
            if tt.experience != experience:
                raise serializers.ValidationError(
                    {
                        "items": f"Ticket type '{tt.name}' does not belong to experience '{experience.name}'."
                    }
                )

            # Null Check for Nationality and Age
            if item.get("nationality_category") is None:
                raise serializers.ValidationError(
                    {"items": f"nationality_category cannot be null for ticket type '{tt.name}'."}
                )
            if item.get("age_category") is None:
                raise serializers.ValidationError(
                    {"items": f"age_category cannot be null for ticket type '{tt.name}'."}
                )

            # Pricing Rule Validation
            pricing_rules = ContentModel.PricingRule.objects.filter(ticket_type=tt)
            if pricing_rules.exists():
                valid_rules = pricing_rules.filter(
                    Q(valid_from__lte=date_to_check)
                    & (Q(valid_to__gte=date_to_check) | Q(valid_to__isnull=True))
                )
                if not valid_rules.exists():
                    raise serializers.ValidationError(
                        {
                            "items": f"No active pricing rule found for ticket type '{tt.name}' on {date_to_check}."
                        }
                    )

                nat = item.get("nationality_category", "Any")
                age = item.get("age_category", "Any")

                cat_matched_rules = valid_rules.filter(
                    (Q(nationality_category__iexact=nat) | Q(nationality_category__iexact="Any"))
                    & (Q(age_category__iexact=age) | Q(age_category__iexact="Any"))
                )

                if not cat_matched_rules.exists():
                    raise serializers.ValidationError(
                        {
                            "items": f"No valid pricing rule matching category ({nat}/{age}) for '{tt.name}'."
                        }
                    )

            # TicketTypeSchedule Validation & Fallback
            if not ts:
                tts_qs = BookingModel.TicketTypeSchedule.objects.filter(
                    ticket_type=tt,
                    is_active=True,
                    schedule__is_active=True,
                )
                valid_tts = [
                    tts
                    for tts in tts_qs
                    if tts.schedule and tts.schedule.is_available_on_date(date_to_check)
                ]

                if len(valid_tts) == 1:
                    ts = valid_tts[0]
                    item["time_slot"] = ts
                elif len(valid_tts) == 0:
                    raise serializers.ValidationError(
                        {
                            "items": f"time_slot is required for ticket type '{tt.name}', but no active schedule is available on {date_to_check}."
                        }
                    )
                else:
                    raise serializers.ValidationError(
                        {
                            "items": f"time_slot is required for ticket type '{tt.name}' because multiple schedules ({len(valid_tts)}) exist. Please select a time_slot."
                        }
                    )

            if ts:
                if hasattr(ts, "is_active") and not ts.is_active:
                    raise serializers.ValidationError(
                        {"items": f"Selected time slot is inactive."}
                    )
                if ts.ticket_type != tt:
                    raise serializers.ValidationError(
                        {
                            "items": f"Selected time slot does not match ticket type '{tt.name}'."
                        }
                    )
                if ts.schedule:
                    sched = ts.schedule
                    if not sched.is_available_on_date(date_to_check):
                        raise serializers.ValidationError(
                            {"items": f"Selected time slot is not available on {date_to_check}."}
                        )

                    if effective_opening and sched.start_time and sched.start_time < effective_opening:
                        raise serializers.ValidationError(
                            {"items": f"Slot start time ({sched.start_time}) is before venue opening time ({effective_opening})."}
                        )
                    if effective_closing and sched.end_time and sched.end_time > effective_closing:
                        raise serializers.ValidationError(
                            {"items": f"Slot end time ({sched.end_time}) is after venue closing time ({effective_closing})."}
                        )

                    # Capacity / Inventory Check
                    if (
                        sched.available_capacity is not None
                        and sched.available_capacity < qty
                    ):
                        raise serializers.ValidationError(
                            {
                                "items": f"Requested quantity ({qty}) exceeds available slot capacity ({sched.available_capacity})."
                            }
                        )

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        experience = validated_data["experience"]
        user = request.user
        items_data = validated_data.pop("items", [])

        try:
            user_data = User_Data.objects.get(user=user)
        except User_Data.DoesNotExist:
            raise serializers.ValidationError(
                "User profile not found. Please complete your profile setup."
            )

        validated_data["user"] = user_data

        constructed_items = []
        for item_info in items_data:
            tt = item_info["ticket_type"]
            ts = item_info.get("time_slot")
            qty = item_info.get("quantity", 1)
            u_price = item_info.get("unit_price")
            if u_price is None:
                pricing_rules = ContentModel.PricingRule.objects.filter(ticket_type=tt)
                nat = item_info.get("nationality_category", "Any")
                age = item_info.get("age_category", "Any")
                pr = None
                if nat and age:
                    pr = pricing_rules.filter(
                        (Q(nationality_category__iexact=nat) | Q(nationality_category__iexact="Any"))
                        & (Q(age_category__iexact=age) | Q(age_category__iexact="Any"))
                    ).first()
                if not pr and nat:
                    pr = pricing_rules.filter(
                        Q(nationality_category__iexact=nat) | Q(nationality_category__iexact="Any")
                    ).first()
                if not pr and age:
                    pr = pricing_rules.filter(
                        Q(age_category__iexact=age) | Q(age_category__iexact="Any")
                    ).first()
                if not pr:
                    pr = pricing_rules.first()

                if pr:
                    u_price = pr.get_final_price()
                else:
                    u_price = experience.entry_fee_base or Decimal("0.00")

            constructed_items.append(
                {
                    "ticket_type": tt,
                    "time_slot": ts,
                    "quantity": qty,
                    "unit_price": u_price,
                    "subtotal": u_price * qty,
                    "nationality_category": item_info.get("nationality_category"),
                    "age_category": item_info.get("age_category"),
                }
            )

        total_tickets = sum(item["quantity"] for item in constructed_items)
        total_amount = sum(item["subtotal"] for item in constructed_items)

        validated_data["total_tickets"] = total_tickets
        validated_data["total_amount"] = total_amount

        booking = BookingModel.Booking.objects.create(**validated_data)

        for item_data in constructed_items:
            BookingModel.BookingItem.objects.create(
                booking=booking,
                ticket_type=item_data["ticket_type"],
                time_slot=item_data.get("time_slot"),
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
                nationality_category=item_data.get("nationality_category"),
                age_category=item_data.get("age_category"),
            )

        return booking

    def to_representation(self, instance):
        return BookingDetailSerializer(instance, context=self.context).data


class BookingDetailSerializer(serializers.ModelSerializer):
    """For GET requests - includes related object details"""

    user = serializers.StringRelatedField(read_only=True)
    experience = ExperienceShortSerializer(read_only=True)
    items = BookingItemSerializer(many=True, read_only=True)

    class Meta:
        model = BookingModel.Booking
        fields = [
            "reference",
            "user",
            "experience",
            "booking_date",
            "total_tickets",
            "total_amount",
            "status",
            "refund_status",
            "special_requests",
            "items",
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
        if booking.status == "confirmed":
            raise serializers.ValidationError(
                "This booking is already confirmed and paid."
            )
        if booking.payments.filter(status="success").exists():
            raise serializers.ValidationError(
                "This booking has already been successfully paid."
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
    booking_reference = serializers.SerializerMethodField()
    booking_date = serializers.SerializerMethodField()
    ticket_type_name = serializers.SerializerMethodField()
    age_category = serializers.SerializerMethodField()
    nationality_category = serializers.SerializerMethodField()
    time_slot = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    experience_id = serializers.SerializerMethodField()
    experience_name = serializers.SerializerMethodField()
    experience_image = serializers.SerializerMethodField()

    class Meta:
        model = BookingModel.Ticket
        fields = [
            "qr_code",
            "qr_image",
            "booking_reference",
            "booking_date",
            "ticket_type_name",
            "age_category",
            "nationality_category",
            "time_slot",
            "quantity",
            "price",
            "is_used",
            "used_at",
            "status",
            "experience_id",
            "experience_name",
            "experience_image",
        ]

    def get_qr_image(self, obj):
        return obj.get_qr_code_image_base64()

    def get_booking_reference(self, obj):
        return (
            obj.booking_item.booking.reference
            if (obj.booking_item and obj.booking_item.booking)
            else None
        )

    def get_booking_date(self, obj):
        return (
            obj.booking_item.booking.booking_date
            if (obj.booking_item and obj.booking_item.booking)
            else None
        )

    def get_ticket_type_name(self, obj):
        return (
            obj.booking_item.ticket_type.name
            if (obj.booking_item and obj.booking_item.ticket_type)
            else None
        )

    def get_age_category(self, obj):
        return (
            obj.booking_item.age_category
            if (obj.booking_item)
            else None
        )

    def get_nationality_category(self, obj):
        return (
            obj.booking_item.nationality_category
            if (obj.booking_item)
            else None
        )

    def get_time_slot(self, obj):
        return (
            f"{obj.booking_item.time_slot.schedule.start_time} - {obj.booking_item.time_slot.schedule.end_time}"
            if (obj.booking_item and obj.booking_item.time_slot)
            else None
        )
        
    def get_quantity(self, obj):
        return (
            obj.booking_item.quantity
            if (obj.booking_item)
            else None
        )

    def get_price(self, obj):
        return (
            obj.booking_item.unit_price
            if (obj.booking_item)
            else None
        )

    def get_status(self, obj):
        return (
            obj.booking_item.booking.status
            if (obj.booking_item and obj.booking_item.booking)
            else None
        )

    def get_experience_id(self, obj):
        return (
            obj.booking_item.booking.experience.public_id
            if (
                obj.booking_item
                and obj.booking_item.booking
                and obj.booking_item.booking.experience
            )
            else None
        )

    def get_experience_name(self, obj):
        return (
            obj.booking_item.booking.experience.name
            if (
                obj.booking_item
                and obj.booking_item.booking
                and obj.booking_item.booking.experience
            )
            else None
        )

    def get_experience_image(self, obj):
        return (
            obj.booking_item.booking.experience.image_url
            if (
                obj.booking_item
                and obj.booking_item.booking
                and obj.booking_item.booking.experience
            )
            else None
        )

    def get_items(self, obj):
        if obj.booking_item and obj.booking_item.booking:
            return BookingItemSerializer(obj.booking_item).data
        return []


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
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_type_public_id = serializers.CharField(
        source="ticket_type.public_id", read_only=True
    )
    time_slot_public_id = serializers.CharField(
        source="time_slot.public_id", read_only=True
    )

    class Meta:
        model = BookingModel.Inventory
        fields = [
            "public_id",
            "ticket_type",
            "ticket_type_name",
            "ticket_type_public_id",
            "time_slot",
            "time_slot_public_id",
            "date",
            "capacity",
            "reserved_count",
            "confirmed_count",
            "used_count",
            "cancelled_count",
            "blocked_count",
            "is_open",
            "created_at",
            "updated_at",
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


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingModel.Seat
        fields = [
            "id",
            "schedule",
            "seat_number",
            "seat_type",
            "status",
        ]


class EnterpriseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enterprise
        fields = [
            "public_id",
            "organization_name",
            "organization_type",
            "gst_number",
            "contact_person",
            "contact_email",
            "contact_phone",
            "website",
            "verification_status",
            "is_active",
        ]


class EnterpriseMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = EnterpriseMember
        fields = [
            "id",
            "enterprise",
            "user",
            "role",
        ]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "name": obj.user.user.get_full_name() or obj.user.user.username,
            "email": obj.user.user.email,
        }


class BulkBookingRequestSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    enterprise_details = serializers.SerializerMethodField()
    experience_name = serializers.SerializerMethodField()
    ticket_type_name = serializers.SerializerMethodField()

    class Meta:
        model = BookingModel.BulkBookingRequest
        fields = [
            "public_id",
            "enterprise",
            "enterprise_details",
            "user",
            "user_details",
            "experience",
            "experience_name",
            "ticket_type",
            "ticket_type_name",
            "booking_date",
            "quantity",
            "notes",
            "status",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "public_id",
            "status",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        ]

    def get_user_details(self, obj):
        return {
            "name": obj.user.user.get_full_name() or obj.user.user.username,
            "email": obj.user.user.email,
        }

    def get_enterprise_details(self, obj):
        if obj.enterprise:
            return {
                "name": obj.enterprise.organization_name,
                "public_id": obj.enterprise.public_id,
            }
        return None

    def get_experience_name(self, obj):
        return obj.experience.name

    def get_ticket_type_name(self, obj):
        return obj.ticket_type.name
