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
from django.db.models import Avg, Count, Q
from user.models import User_Data
from booking.models import Booking
from django.conf import settings
from django.shortcuts import render
import datetime
from django.utils import timezone
import json


import razorpay
from . import serializers as ContentSerializer
from .serializers import UserDataRegisterSerializer
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

    def get_queryset(self):
        return ContentModel.Category.objects.filter(id=self.kwargs["id"])


class ExperienceView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.ExperienceSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"

    def get_queryset(self):
        return (
            ContentModel.Experience.objects.filter(public_id=self.kwargs["public_id"])
            .annotate(
                average_rating=Avg(
                    "reviews__rating", filter=Q(reviews__deleted_at__isnull=True)
                ),
                total_reviews=Count(
                    "reviews", filter=Q(reviews__deleted_at__isnull=True)
                ),
            )
            .select_related("category", "location")
        )


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
            .select_related("category", "location")
        )

        location_param = self.request.query_params.get("location")
        category_param = self.request.query_params.get("category")
        search_query = self.request.query_params.get("search")

        if location_param:
            queryset = queryset.filter(
                Q(location__name__iexact=location_param) | Q(location__public_id__iexact=location_param)
            )

        if category_param:
            normalized_cat = category_param.strip().lower()
            if normalized_cat.endswith("s") and normalized_cat != "religious sites":
                normalized_cat_singular = normalized_cat[:-1]
            else:
                normalized_cat_singular = normalized_cat

            queryset = queryset.filter(
                Q(category__name__iexact=category_param) |
                Q(category__name__iexact=normalized_cat_singular) |
                Q(category__name__icontains=normalized_cat_singular) |
                Q(category__id=category_param if category_param.isdigit() else None)
            )

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class LocationListView(generics.ListAPIView):
    serializer_class = ContentSerializer.LocationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ContentModel.Location.objects.all()


class LocationView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.LocationSerializer
    permission_classes = [AllowAny]
    lookup_field = "public_id"

    def get_queryset(self):
        return ContentModel.Location.objects.filter(public_id=self.kwargs["public_id"])


class BookingView(generics.RetrieveAPIView):
    serializer_class = ContentSerializer.BookingDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "reference"

    def get_queryset(self):
        return BookingModel.Booking.objects.filter(reference=self.kwargs["reference"])


class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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

    def post(self, request):
        serializer = ContentSerializer.CreatePaymentSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        payment = serializer.save()
        amount_ = int(payment.amount * 100)

        order_data = {
            "amount": amount_,
            "currency": "INR",
            "receipt": str(payment.booking),
        }

        razorpay_order = client.order.create(data=order_data)
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
            if settings.DEBUG:
                payment.status = "success"
            else:
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
            ticket_code = str(uuid.uuid4().hex[:6].upper())
            ticket = BookingModel.Ticket.objects.create(
                booking=booking,
                ticket_type="adult",
                price=booking.total_amount,
                qr_code=f"{booking.reference}_{ticket_code}",
            )
            booking.status = "confirmed"
            booking.save(update_fields=["status", "updated_at"])

            return Response(
                {
                    "message": "Payment verified",
                    "ticket": ticket.qr_code,
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
            ).order_by("-created_at")
            bookings_serializer = ContentSerializer.BookingSerializer(
                pending_bookings, many=True
            )
            continue_booking = bookings_serializer.data
        else:
            continue_booking = {}

        # 2. Get all locations
        locations = ContentModel.Location.objects.all()
        locations_serializer = ContentSerializer.LocationSerializer(
            locations, many=True
        )

        # 3. Get featured categories experiences with pagination
        featured_categories_config = [
            {"name": "Museum", "title": "Explore Museums"},
            {"name": "Amusement Park", "title": "Explore Amusement Parks"},
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
        all_categories = ContentModel.Category.objects.all().order_by("name")
        categories_data = []
        for category in all_categories:
            categories_data.append(
                {
                    "id": category.id,
                    "name": category.name,
                    "icon_url": category.icon_url,
                }
            )

        response_data = {
            "continue_booking": continue_booking,
            "explore_locations": {
                "label": "Explore Locations",
                "data": locations_serializer.data,
                "link": reverse("location_list", request=request),
            },
            "featured_categories": featured_categories_data,
            "all_categories": categories_data,
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
                booking__in=confirmed_bookings, is_used=False
            ).select_related("booking", "booking__experience")
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
