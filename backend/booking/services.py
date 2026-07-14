import logging
from django.conf import settings
from user.models import EnterpriseMember
from content.models import ProviderBookingConfiguration
from booking.models import Booking

logger = logging.getLogger(__name__)


# ── CAPTCHA INTEGRATION HOOK ──────────────────────────────────────────

class BaseCaptchaProvider:
    """Interface for CAPTCHA verification providers."""
    def verify(self, token: str, request=None) -> bool:
        raise NotImplementedError("CAPTCHA providers must implement verify()")


class MockCaptchaProvider(BaseCaptchaProvider):
    """A mock CAPTCHA provider that accepts all tokens for development/testing."""
    def verify(self, token: str, request=None) -> bool:
        logger.info(f"[MockCaptcha] Verifying token: {token[:10]}...")
        if not token:
            return False
        return token == "mock-valid-token" or settings.DEBUG


class CaptchaService:
    _provider = MockCaptchaProvider()

    @classmethod
    def set_provider(cls, provider: BaseCaptchaProvider):
        cls._provider = provider

    @classmethod
    def verify(cls, token: str, request=None) -> bool:
        if not cls._provider:
            return True
        return cls._provider.verify(token, request)


# ── BOOKING LIMIT SERVICE ──────────────────────────────────────────────

class BookingLimitService:
    @staticmethod
    def get_provider_config(experience):
        """Helper to get or create provider booking configuration."""
        if not experience or not experience.provider:
            return None
        
        provider = experience.provider
        config = getattr(provider, "booking_configuration", None)
        if not config:
            # Fallback to defaults
            config = ProviderBookingConfiguration(
                provider=provider,
                max_individual_booking=10,
                max_group_booking=20,
                allow_bulk_booking=True,
                require_manual_bulk_approval=True,
                require_email_verification=False,
                require_phone_verification=False,
                require_captcha=False
            )
        return config

    @classmethod
    def detect_enterprise_booking(cls, user_data) -> bool:
        """Check if user belongs to a verified enterprise."""
        if not user_data:
            return False
        membership = EnterpriseMember.objects.filter(user=user_data).select_related("enterprise").first()
        if membership and membership.enterprise.is_active:
            return membership.enterprise.verification_status == "verified"
        return False

    @classmethod
    def determine_max_tickets(cls, user_data, experience) -> int:
        """Determine maximum tickets allowed for a user on a given experience."""
        config = cls.get_provider_config(experience)
        max_ind = config.max_individual_booking if config else 10
        max_grp = config.max_group_booking if config else 20

        # Enterprise users get significantly higher limits (configurable via settings or defaults)
        if cls.detect_enterprise_booking(user_data):
            return getattr(settings, "ENTERPRISE_BOOKING_LIMIT", 500)
        
        return max_ind

    @classmethod
    def detect_bulk_booking(cls, quantity: int, user_data, experience) -> bool:
        """Detect if the quantity represents a bulk booking."""
        config = cls.get_provider_config(experience)
        threshold = config.max_individual_booking if config else 10
        return quantity > threshold

    @classmethod
    def check_booking_allowed(cls, quantity: int, user_data, experience):
        """Validate if the booking request exceeds limits."""
        config = cls.get_provider_config(experience)
        if config and not config.allow_bulk_booking and cls.detect_bulk_booking(quantity, user_data, experience):
            raise ValueError("Bulk booking is not allowed by this provider.")

        max_allowed = cls.determine_max_tickets(user_data, experience)
        if quantity > max_allowed:
            raise ValueError(f"Quantity {quantity} exceeds the maximum ticket limit of {max_allowed}.")


# ── BOOKING VERIFICATION SERVICE ───────────────────────────────────────

class BookingVerificationService:
    @classmethod
    def determine_verification_requirements(cls, quantity: int, user_data, experience) -> list:
        """Determine verification requirements (e.g. Email OTP, CAPTCHA)."""
        requirements = []
        config = BookingLimitService.get_provider_config(experience)
        
        if not config:
            return requirements

        is_enterprise = BookingLimitService.detect_enterprise_booking(user_data)
        is_bulk = BookingLimitService.detect_bulk_booking(quantity, user_data, experience)

        # 1. CAPTCHA verification
        # High-risk bookings (e.g., bulk bookings or if provider requires it)
        if config.require_captcha or is_bulk:
            requirements.append("captcha")

        # 2. Email Verification or Email OTP
        # First booking by new account
        has_previous_bookings = Booking.objects.filter(user=user_data, deleted_at__isnull=True).exists()
        if not has_previous_bookings:
            requirements.append("email_verification")
        
        # Quantity exceeds normal limit (bulk booking) and not verified enterprise
        elif is_bulk and not is_enterprise:
            requirements.append("email_otp")
            
        # Provider specific verification overrides
        if config.require_email_verification and not is_enterprise:
            if "email_verification" not in requirements and "email_otp" not in requirements:
                requirements.append("email_otp")

        if config.require_phone_verification and not is_enterprise:
            requirements.append("phone_otp")

        return requirements
