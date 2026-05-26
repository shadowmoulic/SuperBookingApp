from . import views
from django.urls import path

urlpatterns = [
    path(
        "experience/<str:public_id>", views.ExperienceView.as_view(), name="experience"
    ),
    path(
        "experience/category/<str:category>/",
        views.ExperienceCategoryView.as_view(),
        name="experience_category",
    ),
    path(
        "experience/<str:experience_public_id>/reviews/",
        views.RetrieveExperienceReviewsView.as_view(),
        name="experience_reviews",
    ),
    path("location/", views.LocationListView.as_view(), name="location_list"),
    path("location/<str:public_id>", views.LocationView.as_view(), name="location"),
    path("experiences/", views.ExperienceListView.as_view(), name="experience_list"),
    path("category/<int:id>", views.CategoryView.as_view(), name="category"),
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
    path("reviews/create", views.CreateReviewView.as_view(), name="createreview"),
    path("reviews/retrieve", views.RetrieveReviewView.as_view(), name="retrievereview"),
    path("reviews/update", views.UpdateReviewView.as_view(), name="updatereview"),
    path("reviews/delete", views.DeleteReviewView.as_view(), name="deletereview"),
]
