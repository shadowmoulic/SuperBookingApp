from django.urls import path
from provider_api.views import (
    ProviderLoginView,
    ProviderRefreshView,
    ProviderLogoutView,
    ProviderMeView,
    ProviderHomeView,
    ProviderExperienceListView,
    ProviderBookingListView,
    ProviderTicketListView,
    ProviderInventoryListView,
    ProviderScheduleListView,
    ProviderMemberManageView,
)

urlpatterns = [
    # Authentication Endpoints
    path("auth/login/", ProviderLoginView.as_view(), name="provider-login"),
    path("auth/refresh/", ProviderRefreshView.as_view(), name="provider-refresh"),
    path("auth/logout/", ProviderLogoutView.as_view(), name="provider-logout"),
    path("auth/me/", ProviderMeView.as_view(), name="provider-me"),

    # Provider Member Management
    path("members/", ProviderMemberManageView.as_view(), name="provider-members"),

    # Provider Dashboard & Analytics Home
    path("home/", ProviderHomeView.as_view(), name="provider-home"),
    path("analytics/", ProviderHomeView.as_view(), name="provider-analytics"),

    # Resource Endpoints
    path("experiences/", ProviderExperienceListView.as_view(), name="provider-experiences"),
    path("bookings/", ProviderBookingListView.as_view(), name="provider-bookings"),
    path("tickets/", ProviderTicketListView.as_view(), name="provider-tickets"),
    path("inventory/", ProviderInventoryListView.as_view(), name="provider-inventory"),
    path("schedules/", ProviderScheduleListView.as_view(), name="provider-schedules"),
]
