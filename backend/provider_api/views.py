from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q

from django.contrib.auth.models import User
from content.models import Provider, Experience, TicketType, TicketFeature
from booking.models import Booking, BookingItem, Ticket, Schedule, TicketTypeSchedule, Inventory
from user.models import ProviderMember, User_Data
from provider_api.permissions import IsProviderUser, IsProviderAdminOrOwner, get_provider_for_user
from provider_api.serializers import (
    ProviderProfileSerializer,
    ProviderExperienceDetailSerializer,
    ProviderBookingSerializer,
    ProviderTicketSerializer,
    ProviderInventorySerializer,
    ProviderScheduleSerializer,
    ProviderTicketTypeSerializer,
    ProviderMemberSerializer,
    ProviderMemberCreateSerializer,
)


class ProviderLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        provider = get_provider_for_user(user)
        if not provider:
            return Response(
                {"detail": "User is not associated with any active Provider organization."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response(
            {
                "detail": "Provider login successful",
                "access_token": access_token,
                "refresh_token": str(refresh),
                "provider": ProviderProfileSerializer(provider).data,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )

        # Set auth cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=1800,
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=86400,
        )

        return response


class ProviderRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is missing."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
        except Exception as e:
            return Response(
                {"detail": "Invalid refresh token", "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = Response(
            {"detail": "Token refreshed successfully", "access_token": new_access},
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=1800,
        )
        return response


class ProviderLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Provider logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class ProviderMeView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        return Response(
            {
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                },
                "provider": ProviderProfileSerializer(provider).data if provider else None,
            }
        )


class ProviderHomeView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        if not request.user.has_permission("analytics.view"):
            return Response(
                {"detail": "You do not have permission to view analytics."},
                status=status.HTTP_403_FORBIDDEN,
            )
        provider = get_provider_for_user(request.user)
        if not provider:
            return Response(
                {"detail": "No active provider found for user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Provider's experiences
        experiences = Experience.objects.filter(provider=provider)
        exp_ids = list(experiences.values_list("id", flat=True))

        # Content entities
        ticket_types = TicketType.objects.filter(experience__in=experiences)
        features = TicketFeature.objects.filter(ticket_type__in=ticket_types)
        schedules = Schedule.objects.filter(experience__in=experiences)
        time_slots = TicketTypeSchedule.objects.filter(ticket_type__in=ticket_types)

        # Booking & Ticket entities
        bookings = Booking.objects.filter(experience__in=experiences)
        booking_items = BookingItem.objects.filter(booking__in=bookings)
        tickets = Ticket.objects.filter(booking_item__in=booking_items)
        inventories = Inventory.objects.filter(ticket_type__in=ticket_types)

        # Aggregate Metrics
        total_experiences = len(exp_ids)
        active_experiences = experiences.filter(is_open=True).count()

        total_bookings = bookings.count()
        confirmed_bookings = bookings.filter(status="confirmed").count()
        pending_bookings = bookings.filter(status="pending").count()
        cancelled_bookings = bookings.filter(status="cancelled").count()

        confirmed_revenue_agg = bookings.filter(status="confirmed").aggregate(total=Sum("total_amount"))
        total_revenue = confirmed_revenue_agg["total"] or 0.00

        total_tickets_issued = tickets.count()
        used_tickets_count = tickets.filter(is_used=True).count()
        unused_tickets_count = tickets.filter(is_used=False).count()

        total_ticket_types = ticket_types.count()
        active_ticket_types = ticket_types.filter(is_active=True).count()

        total_features = features.count()
        inclusions_count = features.filter(feature_type="inclusion").count()
        exclusions_count = features.filter(feature_type="exclusion").count()

        total_schedules = schedules.count()
        active_schedules = schedules.filter(is_active=True).count()

        inv_totals = inventories.aggregate(
            total_capacity=Sum("capacity"),
            reserved_count=Sum("reserved_count"),
            confirmed_count=Sum("confirmed_count"),
            used_count=Sum("used_count"),
            cancelled_count=Sum("cancelled_count"),
            blocked_count=Sum("blocked_count"),
        )

        recent_bookings = bookings.select_related("user", "user__user", "experience").prefetch_related("items", "items__ticket_type")[:10]

        return Response(
            {
                "provider": ProviderProfileSerializer(provider).data,
                "analytics": {
                    "experiences": {
                        "total": total_experiences,
                        "active": active_experiences,
                        "inactive": total_experiences - active_experiences,
                    },
                    "bookings": {
                        "total": total_bookings,
                        "confirmed": confirmed_bookings,
                        "pending": pending_bookings,
                        "cancelled": cancelled_bookings,
                        "total_revenue": total_revenue,
                    },
                    "tickets": {
                        "total_issued": total_tickets_issued,
                        "used_count": used_tickets_count,
                        "unused_count": unused_tickets_count,
                    },
                    "ticket_types": {
                        "total": total_ticket_types,
                        "active": active_ticket_types,
                    },
                    "features": {
                        "total": total_features,
                        "inclusions": inclusions_count,
                        "exclusions": exclusions_count,
                    },
                    "schedules": {
                        "total": total_schedules,
                        "active": active_schedules,
                        "configured_time_slots": time_slots.count(),
                    },
                    "inventory": {
                        "total_capacity": inv_totals["total_capacity"] or 0,
                        "reserved_count": inv_totals["reserved_count"] or 0,
                        "confirmed_count": inv_totals["confirmed_count"] or 0,
                        "used_count": inv_totals["used_count"] or 0,
                        "cancelled_count": inv_totals["cancelled_count"] or 0,
                        "blocked_count": inv_totals["blocked_count"] or 0,
                    },
                },
                "experiences": ProviderExperienceDetailSerializer(experiences, many=True).data,
                "recent_bookings": ProviderBookingSerializer(recent_bookings, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class ProviderExperienceListView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        experiences = Experience.objects.filter(provider=provider).prefetch_related("ticket_types", "schedules")
        return Response(
            ProviderExperienceDetailSerializer(experiences, many=True).data,
            status=status.HTTP_200_OK,
        )


class ProviderBookingListView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        experiences = Experience.objects.filter(provider=provider)

        status_param = request.query_params.get("status")
        exp_param = request.query_params.get("experience_id")

        bookings = Booking.objects.filter(experience__in=experiences).select_related(
            "user", "user__user", "experience"
        ).prefetch_related("items", "items__ticket_type")

        if status_param:
            bookings = bookings.filter(status=status_param)
        if exp_param:
            bookings = bookings.filter(experience__public_id=exp_param)

        return Response(
            ProviderBookingSerializer(bookings, many=True).data,
            status=status.HTTP_200_OK,
        )


class ProviderTicketListView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        experiences = Experience.objects.filter(provider=provider)
        ticket_types = TicketType.objects.filter(experience__in=experiences)
        bookings = Booking.objects.filter(experience__in=experiences)
        booking_items = BookingItem.objects.filter(booking__in=bookings)

        is_used_param = request.query_params.get("is_used")
        tickets = Ticket.objects.filter(booking_item__in=booking_items).select_related(
            "booking_item", "booking_item__booking", "booking_item__ticket_type"
        )

        if is_used_param is not None:
            is_used_bool = is_used_param.lower() in ["true", "1"]
            tickets = tickets.filter(is_used=is_used_bool)

        return Response(
            ProviderTicketSerializer(tickets, many=True).data,
            status=status.HTTP_200_OK,
        )


class ProviderInventoryListView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        experiences = Experience.objects.filter(provider=provider)
        ticket_types = TicketType.objects.filter(experience__in=experiences)

        inventories = Inventory.objects.filter(ticket_type__in=ticket_types).select_related(
            "ticket_type", "time_slot"
        )

        date_param = request.query_params.get("date")
        if date_param:
            inventories = inventories.filter(date=date_param)

        return Response(
            ProviderInventorySerializer(inventories, many=True).data,
            status=status.HTTP_200_OK,
        )


class ProviderScheduleListView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        experiences = Experience.objects.filter(provider=provider)

        schedules = Schedule.objects.filter(experience__in=experiences).select_related("experience")
        return Response(
            ProviderScheduleSerializer(schedules, many=True).data,
            status=status.HTTP_200_OK,
        )


class ProviderMemberManageView(APIView):
    permission_classes = [IsProviderUser]

    def get(self, request):
        provider = get_provider_for_user(request.user)
        if not provider:
            return Response(
                {"detail": "Provider not found."}, status=status.HTTP_404_NOT_FOUND
            )

        members = ProviderMember.objects.filter(provider=provider).select_related("user", "user__user")
        return Response(
            ProviderMemberSerializer(members, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        provider = get_provider_for_user(request.user)
        if not provider:
            return Response(
                {"detail": "Provider not found."}, status=status.HTTP_404_NOT_FOUND
            )

        username_or_email = request.data.get("username_or_email") or request.data.get("email") or request.data.get("username")
        role = request.data.get("role", "staff")

        if not username_or_email:
            return Response(
                {"detail": "username_or_email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if not target_user:
                return Response(
                    {"detail": f"User '{username_or_email}' not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user_data, _ = User_Data.objects.get_or_create(user=target_user)

            member, created = ProviderMember.objects.get_or_create(
                provider=provider,
                user=user_data,
                defaults={"role": role},
            )
            if not created:
                member.role = role
                member.save(update_fields=["role", "updated_at"])

            return Response(
                {
                    "message": f"Member {'added' if created else 'updated'} successfully.",
                    "member": ProviderMemberSerializer(member).data,
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        provider = get_provider_for_user(request.user)
        member_id = request.data.get("member_id")
        role = request.data.get("role")

        if not member_id or not role:
            return Response(
                {"detail": "member_id and role are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = ProviderMember.objects.get(id=member_id, provider=provider)
            member.role = role
            member.save(update_fields=["role", "updated_at"])
            return Response(
                {
                    "message": "Member role updated successfully.",
                    "member": ProviderMemberSerializer(member).data,
                },
                status=status.HTTP_200_OK,
            )
        except ProviderMember.DoesNotExist:
            return Response(
                {"detail": "Provider member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request):
        provider = get_provider_for_user(request.user)
        member_id = request.data.get("member_id") or request.query_params.get("member_id")
        user_id = request.data.get("user_id") or request.query_params.get("user_id")

        if not member_id and not user_id:
            return Response(
                {"detail": "member_id or user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if member_id:
                member = ProviderMember.objects.get(id=member_id, provider=provider)
            else:
                member = ProviderMember.objects.get(user__user_id=user_id, provider=provider)

            member.delete()
            return Response(
                {"message": "Provider member removed successfully."},
                status=status.HTTP_200_OK,
            )
        except ProviderMember.DoesNotExist:
            return Response(
                {"detail": "Provider member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
