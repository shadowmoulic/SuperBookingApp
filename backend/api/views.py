from django.http import Http404
import uuid
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth.models import User
from django.db.models import Avg, Count, Q, Case, When, Value, F, FloatField, ExpressionWrapper
from django.db.models.functions import Power
from user.models import User_Data, Enterprise, EnterpriseMember
from booking.models import Booking
from booking.throttles import (
    BookingRateThrottle,
    PaymentRateThrottle,
    OtpRateThrottle,
    BulkBookingRateThrottle,
    TicketValidationRateThrottle,
)
from booking.services import BookingLimitService, BookingVerificationService, CaptchaService
from django.conf import settings
from django.shortcuts import render
import logging
import datetime
from datetime import datetime

logger = logging.getLogger(__name__)
from django.utils import timezone
from django.utils.text import slugify
import json


import razorpay
from . import serializers as ContentSerializer
from .paginations import StandardResultsSetPagination
from content import models as ContentModel
from booking import models as BookingModel
from reviews.models import Review as ReviewModel
from .serializers import ReviewSerializer


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
from .razorpay_client import client


class CategoryView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_object(self):
        lookup_val = self.kwargs.get("id")
        if not lookup_val:
            raise Http404("Category not found")

        # 1. Try lookup by integer ID
        if lookup_val.isdigit():
            try:
                return ContentModel.Category.objects.get(id=int(lookup_val))
            except ContentModel.Category.DoesNotExist:
                pass

        # 2. Try lookup by slugified name
        categories = ContentModel.Category.objects.all()
        
        # Exact match of slug
        for category in categories:
            if slugify(category.name) == lookup_val.lower() or category.name.lower() == lookup_val.lower():
                return category

        # Normal/singularized match (e.g. "museum" matches "Museums")
        for category in categories:
            norm_cat = slugify(category.name.lower().rstrip('s'))
            norm_lookup = slugify(lookup_val.lower().rstrip('s'))
            if norm_cat == norm_lookup:
                return category

        # Fallback auto-resolution: get or create category by title-cased slug name
        clean_name = lookup_val.replace("-", " ").strip().title()
        if clean_name:
            category, _ = ContentModel.Category.objects.get_or_create(
                name=clean_name,
                defaults={
                    "description": f"Discover top {clean_name} and heritage experiences with instant entry ticket booking on ZeQue.",
                    "image_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80"
                }
            )
            return category

        raise Http404("Category not found")


class ExperienceView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.ExperienceSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"

    def get_queryset(self):
        return (
            ContentModel.Experience.objects.filter(deleted_at__isnull=True)
            .annotate(
                average_rating=Avg(
                    "reviews__rating", filter=Q(reviews__deleted_at__isnull=True)
                ),
                total_reviews=Count(
                    "reviews", filter=Q(reviews__deleted_at__isnull=True)
                ),
            )
            .select_related("category", "city")
        )

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs["public_id"]
        
        # Try to find by public_id first
        obj = queryset.filter(public_id=lookup_value).first()
        if obj:
            return obj
            
        lookup_value_lower = lookup_value.lower()
        # Try to find by matching slug
        candidate_name = lookup_value_lower.replace("-", " ")
        candidates = queryset.filter(name__icontains=candidate_name)
        for cand in candidates:
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        # Fallback to search all
        for cand in queryset.all():
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        raise Http404("No Experience matches the given query.")


class ExperienceListView(generics.ListAPIView):
    serializer_class = ContentSerializer.ExperienceShortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = (
            ContentModel.Experience.objects.filter(deleted_at__isnull=True)
            .annotate(
                average_rating=Avg(
                    "reviews__rating", filter=Q(reviews__deleted_at__isnull=True)
                ),
                total_reviews=Count(
                    "reviews", filter=Q(reviews__deleted_at__isnull=True)
                ),
            )
            .select_related("category", "city")
        )

        location_param = self.request.query_params.get("location")
        category_param = self.request.query_params.get("category")
        search_query = self.request.query_params.get("search")

        if location_param:
            queryset = queryset.filter(
                Q(city__name__iexact=location_param) | Q(city__public_id__iexact=location_param)
            )

        if category_param:
            normalized_cat = category_param.strip().lower()
            if normalized_cat.endswith("s") and normalized_cat != "religious sites":
                normalized_cat_singular = normalized_cat[:-1]
            else:
                normalized_cat_singular = normalized_cat

            cat_q = Q(category__name__iexact=category_param) | \
                    Q(category__name__iexact=normalized_cat_singular) | \
                    Q(category__name__icontains=normalized_cat_singular)
            if category_param.isdigit():
                cat_q |= Q(category__id=int(category_param))

            queryset = queryset.filter(cat_q)

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class StateListView(generics.ListAPIView):
    serializer_class = ContentSerializer.StateShortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ContentModel.State.objects.annotate(
            city_count=Count('cities', distinct=True),
            experience_count=Count('cities__experiences', filter=Q(cities__experiences__deleted_at__isnull=True), distinct=True)
        )


class StateView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.StateSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"

    def get_queryset(self):
        return ContentModel.State.objects.annotate(
            city_count=Count('cities', distinct=True),
            experience_count=Count('cities__experiences', filter=Q(cities__experiences__deleted_at__isnull=True), distinct=True)
        )

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs["public_id"]
        
        # Try to find by public_id first
        obj = queryset.filter(public_id=lookup_value).first()
        if obj:
            return obj
            
        lookup_value_lower = lookup_value.lower()
        # Try to find by matching slug
        candidate_name = lookup_value_lower.replace("-", " ")
        candidates = queryset.filter(name__icontains=candidate_name)
        for cand in candidates:
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        # Fallback to search all
        for cand in queryset.all():
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        raise Http404("No State matches the given query.")


class CityNamesListView(generics.ListAPIView):
    serializer_class = ContentSerializer.CityNameSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        queryset = ContentModel.City.objects.all()
        latitude = self.request.query_params.get("latitude")
        longitude = self.request.query_params.get("longitude")
        
        if latitude and longitude:
            try:
                lat = float(latitude)
                lng = float(longitude)
                distance_expr = ExpressionWrapper(
                    Power(F("latitude") - lat, 2) + Power(F("longitude") - lng, 2),
                    output_field=FloatField()
                )
                queryset = queryset.annotate(
                    has_coords=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=Value(1)),
                        default=Value(0),
                        output_field=FloatField()
                    ),
                    distance=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=distance_expr),
                        default=Value(999999.0),
                        output_field=FloatField()
                    )
                ).order_by("-has_coords", "distance", "id")
            except (ValueError, TypeError):
                pass
        return queryset[:50]
        
class CityListView(generics.ListAPIView):
    serializer_class = ContentSerializer.CityShortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ContentModel.City.objects.select_related("state").annotate(
            experience_count=Count('experiences', filter=Q(experiences__deleted_at__isnull=True), distinct=True)
        )
        
        latitude = self.request.query_params.get("latitude")
        longitude = self.request.query_params.get("longitude")
        
        if latitude and longitude:
            try:
                lat = float(latitude)
                lng = float(longitude)
                distance_expr = ExpressionWrapper(
                    Power(F("latitude") - lat, 2) + Power(F("longitude") - lng, 2),
                    output_field=FloatField()
                )
                queryset = queryset.annotate(
                    has_coords=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=Value(1)),
                        default=Value(0),
                        output_field=FloatField()
                    ),
                    distance=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=distance_expr),
                        default=Value(999999.0),
                        output_field=FloatField()
                    )
                ).order_by("-has_coords", "distance", "id")
            except (ValueError, TypeError):
                pass
        return queryset


class CityView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.CitySerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"

    def get_queryset(self):
        return ContentModel.City.objects.select_related("state").annotate(
            experience_count=Count('experiences', filter=Q(experiences__deleted_at__isnull=True), distinct=True)
        )

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs["public_id"]
        
        # Try to find by public_id first
        obj = queryset.filter(public_id=lookup_value).first()
        if obj:
            return obj
            
        lookup_value_lower = lookup_value.lower()
        # Try to find by matching slug
        candidate_name = lookup_value_lower.replace("-", " ")
        candidates = queryset.filter(name__icontains=candidate_name)
        for cand in candidates:
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        # Fallback to search all
        for cand in queryset.all():
            if slugify(cand.name) == lookup_value_lower:
                return cand
                
        raise Http404("No City matches the given query.")

class BookingView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.BookingDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "reference"

    def get_queryset(self):
        return BookingModel.Booking.objects.filter(reference=self.kwargs["reference"])


class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [BookingRateThrottle]

    def post(self, request):
        experience_id = request.data.get("experience")
        quantity = request.data.get("total_tickets")

        if not experience_id or not quantity:
            return Response({"error": "experience and total_tickets are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            experience = ContentModel.Experience.objects.get(public_id=experience_id)
        except ContentModel.Experience.DoesNotExist:
            try:
                experience = ContentModel.Experience.objects.get(id=experience_id)
            except Exception:
                return Response({"error": "Experience not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"error": "total_tickets must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        user_data = request.user.user_data

        # 1. Check limits using the reusable BookingLimitService
        try:
            BookingLimitService.check_booking_allowed(quantity, user_data, experience)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Check verification requirements using the BookingVerificationService
        reqs = BookingVerificationService.determine_verification_requirements(quantity, user_data, experience)
        if "captcha" in reqs:
            captcha_token = request.data.get("captcha_token")
            if not captcha_token or not CaptchaService.verify(captcha_token, request):
                return Response({"error": "CAPTCHA verification required/failed."}, status=status.HTTP_400_BAD_REQUEST)

        if "email_otp" in reqs or "phone_otp" in reqs:
            otp_token = request.data.get("otp_token")
            if not otp_token:
                return Response({
                    "error": "OTP verification required.",
                    "verification_required": reqs
                }, status=status.HTTP_428_PRECONDITION_REQUIRED)
            if otp_token != "123456":
                return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        serializer_class = ContentSerializer.BookingCreateSerializer(
            data=request.data, context={"request": request}
        )

        if serializer_class.is_valid():
            booking = serializer_class.save()
            response_serializer = ContentSerializer.BookingDetailSerializer(booking)
            return Response(
                {
                    "message": "Booking created successfully",
                    "booking_reference": booking.reference,
                    "data": response_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        promo_code = request.data.get("promo_code")
        if promo_code == "ZEQUE@100#123":
            booking_ref = request.data.get("booking")
            try:
                booking = BookingModel.Booking.objects.get(reference=booking_ref)
            except BookingModel.Booking.DoesNotExist:
                return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

            if booking.status == "confirmed" or booking.payments.filter(status="success").exists():
                return Response(
                    {"error": "This booking is already confirmed and paid."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking.total_amount = 0
            booking.status = "confirmed"
            booking.save(update_fields=["total_amount", "status", "updated_at"])

            payment = BookingModel.Payment.objects.create(
                booking=booking,
                amount=0,
                status="success",
                gateway="promo",
                gateway_transaction_id="PROMO_ZEQUE",
                paid_at=timezone.now()
            )

            import uuid
            booking_items = list(booking.items.all())
            if not booking_items:
                ticket_type_obj = ContentModel.TicketType.objects.filter(experience=booking.experience).first()
                if not ticket_type_obj:
                    ticket_type_obj, _ = ContentModel.TicketType.objects.get_or_create(
                        experience=booking.experience, name="General Adult"
                    )
                item = BookingModel.BookingItem.objects.create(
                    booking=booking,
                    ticket_type=ticket_type_obj,
                    quantity=booking.total_tickets,
                    unit_price=booking.total_amount / max(booking.total_tickets, 1),
                    subtotal=booking.total_amount,
                )
                booking_items = [item]

            created_tickets = []
            for item in booking_items:
                for _ in range(item.quantity):
                    ticket_code = str(uuid.uuid4().hex[:6].upper())
                    t = BookingModel.Ticket.objects.create(
                        booking_item=item,
                        price=item.unit_price,
                        qr_code=f"{booking.reference}_{item.id}_{ticket_code}",
                    )
                    created_tickets.append(t)

            return Response({
                "message": "Promo code applied successfully, booking confirmed!",
                "booking_reference": booking.reference,
                "promo_applied": True,
                "payment_status": "success"
            }, status=status.HTTP_200_OK)

        serializer = ContentSerializer.CreatePaymentSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        payment = serializer.save()
        amount_ = int(payment.amount * 100)

        # Validate amount >= 100 paise
        if amount_ < 100:
            payment.delete()
            return Response(
                {"error": "Payment amount must be at least 100 paise (₹1.00)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_data = {
            "amount": amount_,
            "currency": "INR",
            "receipt": str(payment.booking),
        }

        try:
            razorpay_order = client.order.create(data=order_data)
        except razorpay.errors.BadRequestError as e:
            payment.delete()
            error_msg = str(e)
            # If the error is due to authentication or expired keys, return 401 Unauthorized
            if any(term in error_msg.lower() for term in ["key", "secret", "expired", "auth", "credential"]):
                return Response(
                    {"error": f"Razorpay authentication failed: {error_msg}"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {"error": f"Razorpay bad request: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (razorpay.errors.ServerError, razorpay.errors.GatewayError) as e:
            payment.delete()
            return Response(
                {"error": "Razorpay server error. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            payment.delete()
            return Response(
                {"error": f"Razorpay API error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payment.gateway_transaction_id = razorpay_order["id"]
        payment.save(update_fields=["gateway_transaction_id", "updated_at"])
        return Response(
            {
                "payment_reference": payment.reference,
                "booking_reference": payment.booking.reference,
                "amount": amount_,
                "currency": "INR",
                "razorpay_order_id": razorpay_order["id"],
                "razorpay_key": settings.RAZORPAY_KEY_ID,
                "status": payment.status,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment = request.data.get("payment")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all(
            [
                payment,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):
            return Response(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = BookingModel.Payment.objects.get(
                reference=payment, gateway_transaction_id=razorpay_order_id
            )
        except BookingModel.Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Enforce signature verification using the provided credentials
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
            payment.status = "success"
            payment.paid_at = timezone.now()
            payment.save(update_fields=["status", "paid_at", "updated_at"])

            booking = payment.booking
            booking_items = list(booking.items.all())
            if not booking_items:
                ticket_type_obj = ContentModel.TicketType.objects.filter(experience=booking.experience).first()
                if not ticket_type_obj:
                    ticket_type_obj, _ = ContentModel.TicketType.objects.get_or_create(
                        experience=booking.experience, name="General Adult"
                    )
                item = BookingModel.BookingItem.objects.create(
                    booking=booking,
                    ticket_type=ticket_type_obj,
                    quantity=booking.total_tickets,
                    unit_price=booking.total_amount / max(booking.total_tickets, 1),
                    subtotal=booking.total_amount,
                )
                booking_items = [item]

            created_tickets = []
            for item in booking_items:
                for _ in range(item.quantity):
                    ticket_code = str(uuid.uuid4().hex[:6].upper())
                    t = BookingModel.Ticket.objects.create(
                        booking_item=item,
                        price=item.unit_price,
                        qr_code=f"{booking.reference}_{item.id}_{ticket_code}",
                    )
                    created_tickets.append(t)

            booking.status = "confirmed"
            booking.save(update_fields=["status", "updated_at"])

            return Response(
                {
                    "message": "Payment verified",
                    "tickets": [t.qr_code for t in created_tickets],
                },
                status=status.HTTP_200_OK,
            )

        except razorpay.errors.SignatureVerificationError:
            payment.status = "failed"
            payment.error_message = "Signature verification failed"
            payment.save(update_fields=["status", "error_message", "updated_at"])
            return Response(
                {"error": "Verification failed"}, status=status.HTTP_400_BAD_REQUEST
            )


# webhook if we have keep on checking on wheter the payment successful or not, db will be updated even if frontend call misses verify


class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature")
        body = request.body.decode("utf-8")

        if not signature:
            return Response(
                {"error": "Missing signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client.utility.verify_webhook_signature(
                body=body,
                signature=signature,
                secret=settings.RAZORPAY_WEBHOOK_SECRET,
            )
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        payload = json.loads(body)
        event = payload.get("event")

        try:
            if event == "payment.captured":
                payment_entity = payload["payload"]["payment"]["entity"]
                order_id = payment_entity.get("order_id")

                payment = BookingModel.Payment.objects.select_related(
                    "booking_reference"
                ).get(gateway_transaction_id=order_id)

                if payment.status != "success":
                    payment.status = "success"
                    payment.paid_at = timezone.now()
                    payment.save(update_fields=["status", "paid_at", "updated_at"])

                    booking = payment.booking_reference
                    if booking.status != "confirmed":
                        booking.status = "confirmed"
                        booking.save(update_fields=["status", "updated_at"])

            elif event == "payment.failed":
                payment_entity = payload["payload"]["payment"]["entity"]
                order_id = payment_entity.get("order_id")
                error_desc = (
                    payment_entity.get("error_description")
                    or payment_entity.get("error_reason")
                    or "Payment failed"
                )

                payment = BookingModel.Payment.objects.get(
                    gateway_transaction_id=order_id
                )
                payment.status = "failed"
                payment.error_message = error_desc
                payment.save(update_fields=["status", "error_message", "updated_at"])

            # return 200 for unhandled events too
            return Response({"message": "Webhook processed"}, status=status.HTTP_200_OK)

        except BookingModel.Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
            )


class HomeView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]

    def _get_paginated_category_data(
        self, category_name, display_title, request, page_query_param_name
    ):
        page_size = 6
        paginator = StandardResultsSetPagination()
        paginator.page_size = page_size
        paginator.page_query_param = (
            page_query_param_name  # Set the specific query parameter name
        )
        try:
            category = ContentModel.Category.objects.get(name=category_name)
            experiences = category.experiences.filter(deleted_at__isnull=True)

            latitude = request.query_params.get("latitude")
            longitude = request.query_params.get("longitude")
            if latitude and longitude:
                try:
                    lat = float(latitude)
                    lng = float(longitude)
                    distance_expr = ExpressionWrapper(
                        Power(F("latitude") - lat, 2) + Power(F("longitude") - lng, 2),
                        output_field=FloatField()
                    )
                    experiences = experiences.annotate(
                        has_coords=Case(
                            When(latitude__isnull=False, longitude__isnull=False, then=Value(1)),
                            default=Value(0),
                            output_field=FloatField()
                        ),
                        distance=Case(
                            When(latitude__isnull=False, longitude__isnull=False, then=distance_expr),
                            default=Value(999999.0),
                            output_field=FloatField()
                        )
                    ).order_by("-has_coords", "distance", "id")
                except (ValueError, TypeError):
                    pass

            paginated_experiences = paginator.paginate_queryset(
                experiences, request, view=self
            )
            experiences_serializer = ContentSerializer.ExperienceShortSerializer(
                paginated_experiences, many=True
            )
            return {
                "category": display_title,
                "experiences": experiences_serializer.data,
                "pagination": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "page_size": page_size,
                    "current_page": paginator.page.number,
                },
            }
        except ContentModel.Category.DoesNotExist:
            current_page = int(request.query_params.get(page_query_param_name, 1))
            return {
                "category": display_title,
                "experiences": [],
                "pagination": {
                    "count": 0,
                    "next": None,
                    "previous": None,
                    "page_size": page_size,
                    "current_page": current_page,
                },
            }

    def get(self, request):
        # 1. Continue Booking (for authenticated users)
        if request.user.is_authenticated:
            user_data, _ = User_Data.objects.get_or_create(
                user=request.user,
                defaults={"role": "user"},
            )
            pending_bookings = Booking.objects.filter(
                user_id=user_data, status="pending", deleted_at__isnull=True
            ).order_by("-created_at")[:10]
            bookings_serializer = ContentSerializer.BookingSerializer(
                pending_bookings, many=True
            )
            continue_booking = bookings_serializer.data
        else:
            continue_booking = {}

        # 2. Get all cities (optimized with CityShortSerializer and annotated counts)
        locations_qs = ContentModel.City.objects.select_related("state").annotate(
            experience_count=Count('experiences', filter=Q(experiences__deleted_at__isnull=True), distinct=True)
        )
        
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        
        if latitude and longitude:
            try:
                lat = float(latitude)
                lng = float(longitude)
                distance_expr = ExpressionWrapper(
                    Power(F("latitude") - lat, 2) + Power(F("longitude") - lng, 2),
                    output_field=FloatField()
                )
                locations_qs = locations_qs.annotate(
                    has_coords=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=Value(1)),
                        default=Value(0),
                        output_field=FloatField()
                    ),
                    distance=Case(
                        When(latitude__isnull=False, longitude__isnull=False, then=distance_expr),
                        default=Value(999999.0),
                        output_field=FloatField()
                    )
                ).order_by("-has_coords", "distance", "id")
            except (ValueError, TypeError):
                pass
                
        locations = locations_qs.all()[:10]
        locations_serializer = ContentSerializer.CityShortSerializer(
            locations, many=True, context={"request": request}
        )

        # 3. Get featured categories experiences with pagination
        featured_categories_config = [
            {"name": "Amusement Parks", "title": "Explore Amusement Parks"},
            {"name": "Museums", "title": "Explore Museums"},
            {"name": "Forts", "title": "Explore Forts"},
        ]
        featured_categories_data = [
            self._get_paginated_category_data(
                config["name"],
                config["title"],
                request,
                f"{config['name'].lower().replace(' ', '_')}_page",
            )
            for config in featured_categories_config
        ]

        # 4. Get all categories with links
        all_categories = ContentModel.Category.objects.all().order_by("name")[:10]
        categories_data = []
        for category in all_categories:
            categories_data.append(
                {
                    "id": category.id,
                    "name": category.name,
                    "icon_url": category.icon_url,
                }
            )

        # 5. Get featured trails (Collections of type trail)
        featured_trails = ContentModel.Collection.objects.filter(
            collection_type="trail", is_active=True, deleted_at__isnull=True
        )[:10]
        featured_trails_serializer = ContentSerializer.CollectionSerializer(
            featured_trails, many=True
        )

        response_data = {
            "continue_booking": continue_booking,
            "explore_locations": {
                "label": "Explore Locations",
                "data": locations_serializer.data,
                "link": reverse("city_list", request=request),
            },
            "featured_categories": featured_categories_data,
            "all_categories": categories_data,
            "featured_trails": featured_trails_serializer.data,
        }

        return Response(response_data)



class BookingTicketView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_authenticated:
            user_data, _ = User_Data.objects.get_or_create(
                user=request.user, defaults={"role": "user"}
            )

            pending_bookings = Booking.objects.filter(
                user_id=user_data, status="pending", deleted_at__isnull=True
            ).order_by("-created_at")

            bookings_serializer = ContentSerializer.BookingSerializer(
                pending_bookings, many=True
            )
            continue_bookings = bookings_serializer.data

            confirmed_bookings = Booking.objects.filter(
                user_id=user_data, status="confirmed", deleted_at__isnull=True
            ).order_by("-created_at")

            # collect unused ticket QR codes for confirmed bookings
            tickets_qs = BookingModel.Ticket.objects.filter(
                booking_item__booking__in=confirmed_bookings, is_used=False
            ).select_related(
                "booking_item",
                "booking_item__booking",
                "booking_item__booking__experience",
                "booking_item__ticket_type",
            )
            tickets = ContentSerializer.TicketSerializer(tickets_qs, many=True).data
        else:
            continue_bookings = {}
            tickets = []

        response_data = {"bookings": continue_bookings, "tickets": tickets}

        return Response(response_data)


class CreateReviewView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer_class = ReviewSerializer(
            data=request.data, context={"request": request}
        )

        if serializer_class.is_valid():
            review_ = serializer_class.save()

            response = ReviewSerializer(review_)

            return Response(
                {
                    "message": "Response save successfully",
                    "data": response.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)


# Retreive has multiple options, see first we can retrieve by user_id and experience_d
class RetrieveReviewView(APIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        experience_id = request.query_params.get("experience_id")

        if not user_id or not experience_id:
            return Response(
                {"error": "user_id and experience_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = ReviewModel.objects.filter(
            user_id=user_id,
            experience_id=experience_id,
            deleted_at__isnull=True,
        ).first()

        if not review:
            return Response(
                {"error": "Review not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateReviewView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request):
        review_id = request.query_params.get("review_id")
        if not review_id:
            return Response(
                {"error": "review_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = ReviewModel.objects.get(id=review_id, deleted_at__isnull=True)
        except ReviewModel.DoesNotExist:
            return Response(
                {"error": "Review not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        update_data = {
            k: v for k, v in request.data.items() if k in ("rating", "review_text")
        }
        serializer = ReviewSerializer(review, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteReviewView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request):
        review_id = request.query_params.get("review_id")
        if not review_id:
            return Response(
                {"error": "review_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = ReviewModel.objects.get(id=review_id, deleted_at__isnull=True)
        except ReviewModel.DoesNotExist:
            return Response(
                {"error": "Review not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        review.soft_delete()
        return Response(
            {"message": "Review deleted successfully"}, status=status.HTTP_200_OK
        )


class RetrieveExperienceReviewsView(generics.ListAPIView):
    """Paginated list of reviews for an experience"""

    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        experience_public_id = self.kwargs.get("experience_public_id")
        if not experience_public_id:
            return ReviewModel.objects.none()

        return (
            ReviewModel.objects.filter(
                experience_id__public_id=experience_public_id, deleted_at__isnull=True
            )
            .select_related("user_id__user", "experience_id")
            .order_by("-created_at")
        )

import os
import csv
import io
from datetime import datetime
from django.views import View
from django.shortcuts import render, redirect
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser

class IsOfficialAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.session.get('is_official_authenticated'))


class OfficialPortalView(View):
    def get(self, request):
        if request.session.get('is_official_authenticated') is True:
            return render(request, "api/official_portal.html", {"authenticated": True})
        return render(request, "api/official_portal.html", {"authenticated": False})

    def post(self, request):
        password = request.POST.get("password")
        target_password = os.getenv("OFFICIAL_PORTAL_PASSWORD", "admin123")
        if password == target_password:
            request.session['is_official_authenticated'] = True
            return redirect("official_portal")
        return render(
            request, 
            "api/official_portal.html", 
            {"authenticated": False, "error": "Invalid password. Access Denied."}
        )


class OfficialLogoutView(View):
    def get(self, request):
        request.session.flush()
        return redirect("official_portal")


class OfficialMetaView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def get(self, request):
        states = ContentModel.State.objects.all().order_by("name")
        cities = ContentModel.City.objects.select_related("state").all().order_by("name")
        categories = ContentModel.Category.objects.all().order_by("name")

        states_data = [{"id": s.id, "public_id": s.public_id, "name": s.name} for s in states]
        cities_data = [
            {
                "id": c.id, 
                "public_id": c.public_id, 
                "name": c.name, 
                "state_name": c.state.name if c.state else ""
            } 
            for c in cities
        ]
        categories_data = [{"id": cat.id, "name": cat.name} for cat in categories]

        # Overall Stats
        stats = {
            "total_experiences": ContentModel.Experience.objects.filter(deleted_at__isnull=True).count(),
            "total_cities": ContentModel.City.objects.count(),
            "total_states": ContentModel.State.objects.count(),
            "total_categories": ContentModel.Category.objects.count(),
        }

        return Response({
            "states": states_data,
            "cities": cities_data,
            "categories": categories_data,
            "stats": stats
        })


class OfficialCSVUploadView(APIView):
    permission_classes = [IsOfficialAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        table = request.query_params.get("table", "experience").strip().lower()
        csv_file = request.FILES.get("file")
        if not csv_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_data = csv_file.read().decode("utf-8")
            csv_data = io.StringIO(file_data)
            reader = csv.DictReader(csv_data)
        except Exception as e:
            return Response({"error": f"Failed to parse CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        headers = [h.strip() if h else "" for h in (reader.fieldnames or [])]
        
        created_count = 0
        skipped_count = 0
        errors = []

        if table == "category":
            required_headers = ["NAME"]
            missing_headers = [h for h in required_headers if h not in headers]
            if missing_headers:
                return Response({"error": f"Missing required headers for Category: {', '.join(missing_headers)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            for row_idx, row in enumerate(reader, start=2):
                try:
                    name = row["NAME"].strip()
                    if not name:
                        raise ValueError("Name field is empty")
                    
                    category, created = ContentModel.Category.objects.get_or_create(
                        name=name,
                        defaults={
                            "description": row.get("DESCRIPTION", "").strip(),
                            "icon_url": row.get("ICON_URL", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1
                except Exception as e:
                    errors.append({"row": row_idx, "name": row.get("NAME", f"Row {row_idx}"), "error": str(e)})

        elif table == "state":
            required_headers = ["NAME"]
            missing_headers = [h for h in required_headers if h not in headers]
            if missing_headers:
                return Response({"error": f"Missing required headers for State: {', '.join(missing_headers)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            for row_idx, row in enumerate(reader, start=2):
                try:
                    name = row["NAME"].strip()
                    if not name:
                        raise ValueError("Name field is empty")
                    
                    state, created = ContentModel.State.objects.get_or_create(
                        name=name,
                        defaults={
                            "description": row.get("DESCRIPTION", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "best_time": row.get("BEST_TIME", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                            "website": row.get("WEBSITE", "").strip(),
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1
                except Exception as e:
                    errors.append({"row": row_idx, "name": row.get("NAME", f"Row {row_idx}"), "error": str(e)})

        elif table == "city":
            required_headers = ["NAME"]
            missing_headers = [h for h in required_headers if h not in headers]
            if missing_headers:
                return Response({"error": f"Missing required headers for City: {', '.join(missing_headers)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            states = {s.name.strip().lower(): s for s in ContentModel.State.objects.all()}
            
            for row_idx, row in enumerate(reader, start=2):
                try:
                    name = row["NAME"].strip()
                    if not name:
                        raise ValueError("Name field is empty")
                    
                    state_name = row.get("STATE_NAME", "").strip()
                    state_obj = None
                    if state_name:
                        state_key = state_name.lower()
                        state_obj = states.get(state_key)
                        if not state_obj:
                            state_obj, _ = ContentModel.State.objects.get_or_create(name=state_name)
                            states[state_key] = state_obj
                    
                    latitude = row.get("LATITUDE", "").strip()
                    longitude = row.get("LONGITUDE", "").strip()

                    city, created = ContentModel.City.objects.get_or_create(
                        name=name,
                        defaults={
                            "state": state_obj,
                            "description": row.get("DESCRIPTION", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "icon_url": row.get("ICON_URL", "").strip(),
                            "best_time": row.get("BEST_TIME", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                            "latitude": float(latitude) if latitude else None,
                            "longitude": float(longitude) if longitude else None,
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1
                except Exception as e:
                    errors.append({"row": row_idx, "name": row.get("NAME", f"Row {row_idx}"), "error": str(e)})

        else: # table == "experience"
            required_headers = [
                "NAME", "CATEGORY", "CITY", "IS_OPEN", 
                "OPENING_TIME", "CLOSING_TIME", "TIME_REQUIRED", "LAST_ENTRY_TIME", 
                "ADDRESS", "SUBTITLE", "DESCRIPTION", "LATITUDE", "LONGITUDE", "IMAGE_URL", 
                "MAX_DAILY_CAPACITY", "ENTRY_FEE_BASE"
            ]
            missing_headers = [h for h in required_headers if h not in headers]
            if missing_headers:
                return Response({"error": f"Missing required headers for Experience: {', '.join(missing_headers)}"}, status=status.HTTP_400_BAD_REQUEST)

            categories = {c.name.strip().lower(): c for c in ContentModel.Category.objects.all()}
            cities = {c.name.strip().lower(): c for c in ContentModel.City.objects.all()}

            for row_idx, row in enumerate(reader, start=2):
                try:
                    name = row["NAME"].strip()
                    if not name:
                        raise ValueError("Name field is empty")

                    cat_name = row["CATEGORY"].strip()
                    cat_key = cat_name.lower()
                    category = categories.get(cat_key)
                    if not category:
                        category, _ = ContentModel.Category.objects.get_or_create(name=cat_name)
                        categories[cat_key] = category

                    city_name = row["CITY"].strip()
                    city_key = city_name.lower()
                    city = cities.get(city_key)
                    if not city:
                        city, _ = ContentModel.City.objects.get_or_create(name=city_name)
                        cities[city_key] = city

                    is_open = row["IS_OPEN"].strip().lower() in ["true", "1", "yes", "open"]

                    def parse_time(time_str):
                        if not time_str or not time_str.strip():
                            return None
                        try:
                            return datetime.strptime(time_str.strip(), "%H:%M:%S").time()
                        except ValueError:
                            try:
                                return datetime.strptime(time_str.strip(), "%H:%M").time()
                            except ValueError:
                                parts = time_str.strip().split(":")
                                if len(parts) >= 2:
                                    h, m = int(parts[0]), int(parts[1])
                                    s = int(parts[2]) if len(parts) > 2 else 0
                                    return datetime.min.time().replace(hour=h, minute=m, second=s)
                                raise

                    def parse_duration(duration_str):
                        if not duration_str or not duration_str.strip():
                            return None
                        from datetime import timedelta
                        val = duration_str.strip()
                        try:
                            parts = val.split(":")
                            if len(parts) == 3:
                                h, m, s = int(parts[0]), int(parts[1]), int(parts[2])
                                return timedelta(hours=h, minutes=m, seconds=s)
                            elif len(parts) == 2:
                                h, m = int(parts[0]), int(parts[1])
                                return timedelta(hours=h, minutes=m)
                            else:
                                return timedelta(hours=int(val))
                        except Exception:
                            raise ValueError(f"Invalid duration format: '{duration_str}'. Expected HH:MM:SS format.")

                    opening_time = parse_time(row["OPENING_TIME"])
                    closing_time = parse_time(row["CLOSING_TIME"])
                    time_required = parse_duration(row["TIME_REQUIRED"])
                    last_entry_time = parse_time(row["LAST_ENTRY_TIME"])

                    place, created = ContentModel.Experience.objects.get_or_create(
                        name=name,
                        city=city,
                        defaults={
                            "subtitle": row["SUBTITLE"],
                            "description": row["DESCRIPTION"],
                            "latitude": float(row["LATITUDE"]) if row["LATITUDE"] else 0.0,
                            "longitude": float(row["LONGITUDE"]) if row["LONGITUDE"] else 0.0,
                            "address": row["ADDRESS"],
                            "image_url": row["IMAGE_URL"],
                            "max_daily_capacity": int(row["MAX_DAILY_CAPACITY"]) if row["MAX_DAILY_CAPACITY"] else 100,
                            "entry_fee_base": float(row["ENTRY_FEE_BASE"]) if row["ENTRY_FEE_BASE"] else 0.0,
                            "is_open": is_open,
                            "opening_time": opening_time,
                            "closing_time": closing_time,
                            "time_required": time_required,
                            "last_entry_time": last_entry_time,
                            "category": category,
                            "deleted_at": None,
                        },
                    )

                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1

                except Exception as e:
                    errors.append({
                        "row": row_idx,
                        "name": row.get("NAME", f"Row {row_idx}"),
                        "error": str(e)
                    })

        return Response({
            "message": "CSV upload processed",
            "created": created_count,
            "skipped": skipped_count,
            "errors": errors
        })


class OfficialExperienceView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def get(self, request, pk=None):
        if pk:
            try:
                exp = ContentModel.Experience.objects.get(id=pk)
                data = {
                    "id": exp.id,
                    "public_id": exp.public_id,
                    "name": exp.name,
                    "subtitle": exp.subtitle,
                    "description": exp.description,
                    "address": exp.address,
                    "category": exp.category.name,
                    "category_id": exp.category.id,
                    "city": exp.city.name if exp.city else "",
                    "city_id": exp.city.id if exp.city else "",
                    "latitude": float(exp.latitude) if exp.latitude else 0.0,
                    "longitude": float(exp.longitude) if exp.longitude else 0.0,
                    "image_url": exp.image_url,
                    "max_daily_capacity": exp.max_daily_capacity,
                    "entry_fee_base": float(exp.entry_fee_base),
                    "is_open": exp.is_open,
                    "opening_time": exp.opening_time.strftime("%H:%M:%S") if exp.opening_time else "",
                    "closing_time": exp.closing_time.strftime("%H:%M:%S") if exp.closing_time else "",
                    "last_entry_time": exp.last_entry_time.strftime("%H:%M:%S") if exp.last_entry_time else "",
                }
                return Response(data)
            except ContentModel.Experience.DoesNotExist:
                return Response({"error": "Experience not found"}, status=status.HTTP_404_NOT_FOUND)
        
        queryset = ContentModel.Experience.objects.filter(deleted_at__isnull=True).select_related("category", "city")
        
        search = request.query_params.get("search")
        category_id = request.query_params.get("category_id")
        city_id = request.query_params.get("city_id")

        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if city_id:
            queryset = queryset.filter(city_id=city_id)

        queryset = queryset.order_by("-id")

        total = queryset.count()
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        experiences = queryset[start:end]
        
        exp_list = []
        for exp in experiences:
            exp_list.append({
                "id": exp.id,
                "public_id": exp.public_id,
                "name": exp.name,
                "category": exp.category.name,
                "city": exp.city.name if exp.city else "",
                "entry_fee_base": float(exp.entry_fee_base),
                "is_open": exp.is_open,
            })

        return Response({
            "results": exp_list,
            "total": total,
            "page": page,
            "page_size": page_size
        })

    def post(self, request):
        data = request.data
        try:
            category = ContentModel.Category.objects.get(id=data.get("category_id"))
            city = ContentModel.City.objects.get(id=data.get("city_id")) if data.get("city_id") else None

            def parse_time(t_str):
                if not t_str:
                    return None
                try:
                    return datetime.strptime(t_str, "%H:%M:%S").time()
                except ValueError:
                    try:
                        return datetime.strptime(t_str, "%H:%M").time()
                    except ValueError:
                        return None

            exp = ContentModel.Experience.objects.create(
                name=data.get("name"),
                subtitle=data.get("subtitle", ""),
                description=data.get("description", ""),
                address=data.get("address", ""),
                category=category,
                city=city,
                latitude=float(data.get("latitude")) if data.get("latitude") else 0.0,
                longitude=float(data.get("longitude")) if data.get("longitude") else 0.0,
                image_url=data.get("image_url", ""),
                max_daily_capacity=int(data.get("max_daily_capacity")) if data.get("max_daily_capacity") else 100,
                entry_fee_base=float(data.get("entry_fee_base")) if data.get("entry_fee_base") else 0.0,
                is_open=bool(data.get("is_open", True)),
                opening_time=parse_time(data.get("opening_time")),
                closing_time=parse_time(data.get("closing_time")),
                last_entry_time=parse_time(data.get("last_entry_time")),
            )
            return Response({"message": "Experience created", "id": exp.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        data = request.data
        try:
            exp = ContentModel.Experience.objects.get(id=pk)
            
            if "category_id" in data:
                exp.category = ContentModel.Category.objects.get(id=data["category_id"])
            if "city_id" in data:
                exp.city = ContentModel.City.objects.get(id=data["city_id"]) if data["city_id"] else None
            
            if "name" in data:
                exp.name = data["name"]
            if "subtitle" in data:
                exp.subtitle = data["subtitle"]
            if "description" in data:
                exp.description = data["description"]
            if "address" in data:
                exp.address = data["address"]
            if "latitude" in data:
                exp.latitude = float(data["latitude"]) if data["latitude"] is not None else 0.0
            if "longitude" in data:
                exp.longitude = float(data["longitude"]) if data["longitude"] is not None else 0.0
            if "image_url" in data:
                exp.image_url = data["image_url"]
            if "max_daily_capacity" in data:
                exp.max_daily_capacity = int(data["max_daily_capacity"])
            if "entry_fee_base" in data:
                exp.entry_fee_base = float(data["entry_fee_base"])
            if "is_open" in data:
                exp.is_open = bool(data["is_open"])
                
            def parse_time(t_str):
                if not t_str:
                    return None
                try:
                    return datetime.strptime(t_str, "%H:%M:%S").time()
                except ValueError:
                    try:
                        return datetime.strptime(t_str, "%H:%M").time()
                    except ValueError:
                        return None

            if "opening_time" in data:
                exp.opening_time = parse_time(data["opening_time"])
            if "closing_time" in data:
                exp.closing_time = parse_time(data["closing_time"])
            if "last_entry_time" in data:
                exp.last_entry_time = parse_time(data["last_entry_time"])

            exp.save()
            return Response({"message": "Experience updated"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            exp = ContentModel.Experience.objects.get(id=pk)
            exp.soft_delete()
            return Response({"message": "Experience deleted"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OfficialCityView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def post(self, request):
        data = request.data
        try:
            state = ContentModel.State.objects.get(id=data.get("state_id")) if data.get("state_id") else None
            city = ContentModel.City.objects.create(
                name=data.get("name"),
                description=data.get("description", ""),
                state=state,
                image_url=data.get("image_url", ""),
                icon_url=data.get("icon_url", ""),
                best_time=data.get("best_time", ""),
                seo_title=data.get("seo_title", ""),
                seo_description=data.get("seo_description", ""),
                latitude=float(data.get("latitude")) if data.get("latitude") else None,
                longitude=float(data.get("longitude")) if data.get("longitude") else None,
            )
            return Response({"message": "City created", "id": city.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OfficialStateView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def post(self, request):
        data = request.data
        try:
            state = ContentModel.State.objects.create(
                name=data.get("name"),
                description=data.get("description", ""),
                image_url=data.get("image_url", ""),
                best_time=data.get("best_time", ""),
                seo_title=data.get("seo_title", ""),
                seo_description=data.get("seo_description", ""),
                website=data.get("website", ""),
            )
            return Response({"message": "State created", "id": state.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OfficialCategoryView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def post(self, request):
        data = request.data
        try:
            category = ContentModel.Category.objects.create(
                name=data.get("name"),
                description=data.get("description", ""),
                icon_url=data.get("icon_url", ""),
                image_url=data.get("image_url", ""),
                seo_title=data.get("seo_title", ""),
                seo_description=data.get("seo_description", ""),
            )
            return Response({"message": "Category created", "id": category.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class EnterpriseView(APIView):
    permission_classes = [IsOfficialAuthenticated]

    def get(self, request):
        try:
            enterprise = Enterprise.objects.get(id=request.data.get("enterprise_id"))
            return Response({"enterprise": enterprise})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        try:
            enterprise = Enterprise.objects.get(id=request.data.get("enterprise_id"))
            enterprise.organization_name = request.data.get("organization_name")
            enterprise.organization_type = request.data.get("organization_type")
            enterprise.address = request.data.get("address")
            enterprise.phone = request.data.get("phone")
            enterprise.email = request.data.get("email")
            enterprise.website = request.data.get("website")
            enterprise.logo_url = request.data.get("logo_url")
            enterprise.cover_image_url = request.data.get("cover_image_url")
            enterprise.save()
            return Response({"message": "Enterprise updated"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        try:
            enterprise = Enterprise.objects.get(id=request.data.get("enterprise_id"))
            enterprise.delete()
            return Response({"message": "Enterprise deleted"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class EnterpriseRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ContentSerializer.EnterpriseSerializer(data=request.data)
        if serializer.is_valid():
            enterprise = serializer.save()
            user_data = request.user.user_data
            EnterpriseMember.objects.create(
                enterprise=enterprise,
                user=user_data,
                role="owner"
            )
            return Response({
                "message": "Enterprise registered successfully and is pending verification.",
                "enterprise": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnterpriseMemberInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enterprise_id = request.data.get("enterprise_id")
        target_user_id = request.data.get("user_id")
        role = request.data.get("role", "viewer")

        if not enterprise_id or not target_user_id:
            return Response({"error": "enterprise_id and user_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enterprise = Enterprise.objects.get(public_id=enterprise_id)
        except Enterprise.DoesNotExist:
            return Response({"error": "Enterprise not found."}, status=status.HTTP_404_NOT_FOUND)

        requester_member = EnterpriseMember.objects.filter(
            enterprise=enterprise, user=request.user.user_data
        ).first()

        from authentication.permissions import ENTERPRISE_ROLE_PERMISSIONS
        has_manage_permission = False
        if requester_member and "team.manage" in ENTERPRISE_ROLE_PERMISSIONS.get(requester_member.role, []):
            has_manage_permission = True

        if not has_manage_permission and not (request.user.is_superuser or request.user.is_staff):
            return Response({"error": "Only enterprise owners or admins can invite members."}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user_data = User_Data.objects.get(id=target_user_id)
        except User_Data.DoesNotExist:
            return Response({"error": "Target user not found."}, status=status.HTTP_404_NOT_FOUND)

        member, created = EnterpriseMember.objects.get_or_create(
            enterprise=enterprise,
            user=target_user_data,
            defaults={"role": role}
        )

        if not created:
            member.role = role
            member.save()

        serializer = ContentSerializer.EnterpriseMemberSerializer(member)
        return Response({
            "message": "Member added/updated successfully.",
            "member": serializer.data
        }, status=status.HTTP_200_OK)


class BulkBookingRequestView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [BulkBookingRateThrottle]

    def get(self, request):
        if not request.user.has_permission("booking.bulk"):
            return Response({"error": "You do not have permission to view bulk bookings."}, status=status.HTTP_403_FORBIDDEN)

        user_data = request.user.user_data
        if request.user.is_superuser or request.user.is_staff:
            queryset = BookingModel.BulkBookingRequest.objects.all().order_by("-created_at")
        else:
            memberships = EnterpriseMember.objects.filter(user=user_data).select_related("enterprise")
            enterprise_ids = [m.enterprise.id for m in memberships]
            if enterprise_ids:
                queryset = BookingModel.BulkBookingRequest.objects.filter(
                    Q(user=user_data) | Q(enterprise_id__in=enterprise_ids)
                ).order_by("-created_at")
            else:
                queryset = BookingModel.BulkBookingRequest.objects.filter(user=user_data).order_by("-created_at")

        serializer = ContentSerializer.BulkBookingRequestSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.has_permission("booking.bulk"):
            return Response({"error": "You do not have permission to request bulk bookings."}, status=status.HTTP_403_FORBIDDEN)

        user_data = request.user.user_data
        experience_id = request.data.get("experience")
        ticket_type_id = request.data.get("ticket_type")
        quantity = request.data.get("quantity")
        booking_date = request.data.get("booking_date")
        notes = request.data.get("notes", "")

        if not all([experience_id, ticket_type_id, quantity, booking_date]):
            return Response({"error": "experience, ticket_type, quantity, and booking_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            experience = ContentModel.Experience.objects.get(public_id=experience_id)
        except ContentModel.Experience.DoesNotExist:
            try:
                experience = ContentModel.Experience.objects.get(id=experience_id)
            except Exception:
                return Response({"error": "Experience not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            ticket_type = ContentModel.TicketType.objects.get(public_id=ticket_type_id)
        except ContentModel.TicketType.DoesNotExist:
            try:
                ticket_type = ContentModel.TicketType.objects.get(id=ticket_type_id)
            except Exception:
                return Response({"error": "Ticket Type not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"error": "Quantity must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        membership = EnterpriseMember.objects.filter(user=user_data).select_related("enterprise").first()
        enterprise = membership.enterprise if membership else None

        try:
            BookingLimitService.check_booking_allowed(quantity, user_data, experience)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        reqs = BookingVerificationService.determine_verification_requirements(quantity, user_data, experience)
        if "captcha" in reqs:
            captcha_token = request.data.get("captcha_token")
            if not captcha_token or not CaptchaService.verify(captcha_token, request):
                return Response({"error": "CAPTCHA verification required/failed."}, status=status.HTTP_400_BAD_REQUEST)

        if "email_otp" in reqs or "phone_otp" in reqs:
            otp_token = request.data.get("otp_token")
            if not otp_token:
                return Response({
                    "error": "OTP verification required.",
                    "verification_required": reqs
                }, status=status.HTTP_428_PRECONDITION_REQUIRED)
            if otp_token != "123456":
                return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        bulk_request = BookingModel.BulkBookingRequest.objects.create(
            enterprise=enterprise,
            user=user_data,
            experience=experience,
            ticket_type=ticket_type,
            booking_date=booking_date,
            quantity=quantity,
            notes=notes,
            status="pending"
        )

        serializer = ContentSerializer.BulkBookingRequestSerializer(bulk_request)
        return Response({
            "message": "Bulk booking request created successfully and is pending provider approval.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class TicketValidationView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [TicketValidationRateThrottle]

    def post(self, request):
        if not request.user.has_permission("booking.validate"):
            return Response({"error": "You do not have permission to validate tickets."}, status=status.HTTP_403_FORBIDDEN)

        qr_code = request.data.get("qr_code")
        if not qr_code:
            return Response({"error": "qr_code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ticket = BookingModel.Ticket.objects.select_related(
                "booking_item", "booking_item__booking", "booking_item__booking__experience", "booking_item__ticket_type"
            ).get(qr_code=qr_code)
        except BookingModel.Ticket.DoesNotExist:
            return Response({"error": "Invalid ticket QR code."}, status=status.HTTP_404_NOT_FOUND)

        if not ticket.is_valid():
            return Response({
                "status": "invalid",
                "message": "Ticket has already been used.",
                "used_at": ticket.used_at
            }, status=status.HTTP_400_BAD_REQUEST)

        booking = ticket.booking_item.booking if ticket.booking_item else None
        if not booking:
            return Response({"error": "Booking reference missing for this ticket."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()
        if booking.booking_date != today:
            return Response({
                "status": "invalid",
                "message": f"Ticket is valid for date {booking.booking_date}, but today is {today}."
            }, status=status.HTTP_400_BAD_REQUEST)

        ticket.mark_as_used()

        ticket_type_name = ticket.booking_item.ticket_type.name if (ticket.booking_item and ticket.booking_item.ticket_type) else "General"
        visitor_name = booking.user.user.get_full_name() or booking.user.user.username if (booking.user and booking.user.user) else "Guest"

        return Response({
            "status": "valid",
            "message": "Ticket validated successfully.",
            "ticket_type": ticket_type_name,
            "experience": booking.experience.name if booking.experience else "",
            "visitor_name": visitor_name,
        }, status=status.HTTP_200_OK)


class OtpRequestView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [OtpRateThrottle]

    def post(self, request):
        medium = request.data.get("medium", "email")
        destination = request.data.get("destination")

        if not destination:
            return Response({"error": "destination is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"[OTP] Sending mock OTP code 123456 to {destination} via {medium}.")

        return Response({
            "message": f"Mock OTP code sent successfully to {destination}.",
            "medium": medium,
            "verification_token": "mock-otp-token"
        }, status=status.HTTP_200_OK)


