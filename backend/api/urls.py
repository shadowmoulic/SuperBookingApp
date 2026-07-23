from .seo_views import SitemapView, LLMsView
from . import views
from django.urls import path

urlpatterns = [
    path('sitemap.xml', SitemapView.as_view(), name='sitemap'),
    path('llms.txt', LLMsView.as_view(), name='llms'),

    path("experiences/", views.ExperienceListView.as_view(), name="experience_list"),
    path("experience/<str:public_id>", views.ExperienceView.as_view(), name="experience"),
    path("cities/", views.CityListView.as_view(), name="city_list"),
    path("cities/names/", views.CityNamesListView.as_view(), name="city_names"),
    path("city/<str:public_id>", views.CityView.as_view(), name="city"),
    path("states/", views.StateListView.as_view(), name="state_list"),
    path("state/<str:public_id>", views.StateView.as_view(), name="state"),
    path("category/<str:id>", views.CategoryView.as_view(), name="category"),
    path("booking/<str:reference>", views.BookingView.as_view(), name="booking"),
    path("booking/create/", views.CreateBookingView.as_view(), name="createbooking"),
    path("payments/create/", views.CreatePaymentView.as_view(), name="createpayment"),
    path("payments/verify/", views.VerifyPaymentView.as_view(), name="verifypayment"),
    path(
        "payments/webhook/",
        views.RazorpayWebhookView.as_view(),
        name="razorpay_webhook",
    ),
    path("bookings/", views.BookingTicketView.as_view(), name="bookings"),
    # path("signup/", views.SignupView.as_view(), name="signup"),
    path("home/", views.HomeView.as_view(), name="Home_page"),
    path("experience/<str:experience_public_id>/reviews/", views.RetrieveExperienceReviewsView.as_view(), name="experience_reviews"),
    path("reviews/create", views.CreateReviewView.as_view(), name="createreview"),
    path("reviews/retrieve", views.RetrieveReviewView.as_view(), name="retrievereview"),
    path("reviews/update", views.UpdateReviewView.as_view(), name="updatereview"),
    path("reviews/delete", views.DeleteReviewView.as_view(), name="deletereview"),

    # Enterprise & Bulk Booking & Validation routes
    path("enterprises/", views.EnterpriseView.as_view(), name="enterprise_view"),
    path("enterprises/register/", views.EnterpriseRegistrationView.as_view(), name="enterprise_register"),
    path("enterprises/members/", views.EnterpriseMemberInviteView.as_view(), name="enterprise_members"),
    path("bulk-bookings/", views.BulkBookingRequestView.as_view(), name="bulk_bookings"),
    path("tickets/validate/", views.TicketValidationView.as_view(), name="ticket_validate"),
    path("otp/request/", views.OtpRequestView.as_view(), name="otp_request"),

    # Official Portal routes
    path("official-portal/", views.OfficialPortalView.as_view(), name="official_portal"),
    path("official/logout/", views.OfficialLogoutView.as_view(), name="official_logout"),
    path("official/meta/", views.OfficialMetaView.as_view(), name="official_meta"),
    path("official/upload-csv/", views.OfficialCSVUploadView.as_view(), name="official_upload_csv"),
    path("official/experiences/", views.OfficialExperienceView.as_view(), name="official_experiences_list"),
    path("official/experiences/<int:pk>/", views.OfficialExperienceView.as_view(), name="official_experiences_detail"),
    path("official/cities/", views.OfficialCityView.as_view(), name="official_cities"),
    path("official/states/", views.OfficialStateView.as_view(), name="official_states"),
    path("official/categories/", views.OfficialCategoryView.as_view(), name="official_categories"),
]



