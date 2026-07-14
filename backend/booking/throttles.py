from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class SignupRateThrottle(AnonRateThrottle):
    scope = "signup"


class OtpRateThrottle(UserRateThrottle):
    scope = "otp"


class PaymentRateThrottle(UserRateThrottle):
    scope = "payment"


class BookingRateThrottle(UserRateThrottle):
    scope = "booking"


class BulkBookingRateThrottle(UserRateThrottle):
    scope = "bulk_booking"


class TicketValidationRateThrottle(UserRateThrottle):
    scope = "ticket_validation"
