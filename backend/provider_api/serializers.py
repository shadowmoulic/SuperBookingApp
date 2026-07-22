from rest_framework import serializers
from content.models import Provider, Experience, TicketType, TicketFeature
from booking.models import Booking, BookingItem, Ticket, Schedule, TicketTypeSchedule, Inventory
from user.models import ProviderMember, User_Data
from django.contrib.auth.models import User


class ProviderMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.user.username", read_only=True)
    email = serializers.CharField(source="user.user.email", read_only=True)
    first_name = serializers.CharField(source="user.user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.user.last_name", read_only=True)

    class Meta:
        model = ProviderMember
        fields = [
            "id",
            "user_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "created_at",
            "updated_at",
        ]


class ProviderMemberCreateSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=ProviderMember.ROLE_CHOICES, default="staff")


class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = [
            "public_id",
            "name",
            "description",
            "contact_email",
            "contact_phone",
            "website_url",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ProviderFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketFeature
        fields = [
            "id",
            "feature_type",
            "title",
            "description",
            "display_order",
        ]


class ProviderTicketTypeSerializer(serializers.ModelSerializer):
    ticket_features = ProviderFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = TicketType
        fields = [
            "id",
            "public_id",
            "name",
            "description",
            "is_active",
            "ticket_features",
            "created_at",
            "updated_at",
        ]


class ProviderScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            "id",
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


class ProviderTicketTypeScheduleSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_type_public_id = serializers.CharField(source="ticket_type.public_id", read_only=True)
    schedule_start_time = serializers.TimeField(source="schedule.start_time", read_only=True)
    schedule_end_time = serializers.TimeField(source="schedule.end_time", read_only=True)

    class Meta:
        model = TicketTypeSchedule
        fields = [
            "id",
            "public_id",
            "ticket_type",
            "ticket_type_name",
            "ticket_type_public_id",
            "schedule",
            "schedule_start_time",
            "schedule_end_time",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ProviderInventorySerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_type_public_id = serializers.CharField(source="ticket_type.public_id", read_only=True)
    time_slot_public_id = serializers.CharField(source="time_slot.public_id", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
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


class ProviderExperienceDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    city_name = serializers.CharField(source="city.name", read_only=True)
    ticket_types = ProviderTicketTypeSerializer(many=True, read_only=True)
    schedules = ProviderScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Experience
        fields = [
            "public_id",
            "name",
            "subtitle",
            "description",
            "address",
            "city_name",
            "category_name",
            "image_url",
            "max_daily_capacity",
            "entry_fee_base",
            "is_open",
            "opening_time",
            "closing_time",
            "ticket_types",
            "schedules",
            "created_at",
            "updated_at",
        ]


class ProviderBookingItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_type_public_id = serializers.CharField(source="ticket_type.public_id", read_only=True)
    time_slot_public_id = serializers.CharField(source="time_slot.public_id", read_only=True)

    class Meta:
        model = BookingItem
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
            "created_at",
        ]


class ProviderBookingSerializer(serializers.ModelSerializer):
    experience_name = serializers.CharField(source="experience.name", read_only=True)
    experience_public_id = serializers.CharField(source="experience.public_id", read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    items = ProviderBookingItemSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "reference",
            "user_name",
            "user_email",
            "experience_public_id",
            "experience_name",
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

    def get_user_name(self, obj):
        if obj.user and obj.user.user:
            return obj.user.user.get_full_name() or obj.user.user.username
        return "Guest"

    def get_user_email(self, obj):
        if obj.user and obj.user.user:
            return obj.user.user.email
        return ""


class ProviderTicketSerializer(serializers.ModelSerializer):
    booking_reference = serializers.SerializerMethodField()
    booking_date = serializers.SerializerMethodField()
    ticket_type_name = serializers.SerializerMethodField()
    experience_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "qr_code",
            "price",
            "is_used",
            "used_at",
            "ticket_type_name",
            "booking_reference",
            "booking_date",
            "experience_name",
            "created_at",
        ]

    def get_booking_reference(self, obj):
        return obj.booking_item.booking.reference if (obj.booking_item and obj.booking_item.booking) else None

    def get_booking_date(self, obj):
        return obj.booking_item.booking.booking_date if (obj.booking_item and obj.booking_item.booking) else None

    def get_ticket_type_name(self, obj):
        return obj.booking_item.ticket_type.name if (obj.booking_item and obj.booking_item.ticket_type) else None

    def get_experience_name(self, obj):
        return obj.booking_item.booking.experience.name if (obj.booking_item and obj.booking_item.booking and obj.booking_item.booking.experience) else None
