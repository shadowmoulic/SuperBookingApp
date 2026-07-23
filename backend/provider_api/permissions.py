from rest_framework.permissions import BasePermission
from content.models import Provider
from user.models import User_Data, ProviderMember


def get_provider_membership_for_user(user):
    """Retrieve the ProviderMember instance associated with the authenticated Django user."""
    if not user or not user.is_authenticated:
        return None

    try:
        user_data = User_Data.objects.get(user=user)
        membership = ProviderMember.objects.filter(
            user=user_data, provider__is_active=True, provider__deleted_at__isnull=True
        ).first()
        if membership:
            return membership
    except User_Data.DoesNotExist:
        pass

    return None


def get_provider_for_user(user):
    """Retrieve the Provider model instance associated with the authenticated Django user."""
    if not user or not user.is_authenticated:
        return None

    # Check 1: Explicit ProviderMember record
    membership = get_provider_membership_for_user(user)
    if membership:
        return membership.provider

    # Check 2: Provider contact_email matches User email
    if user.email:
        provider = Provider.objects.filter(
            contact_email__iexact=user.email, is_active=True, deleted_at__isnull=True
        ).first()
        if provider:
            return provider

    # Check 3: Provider contact_email matches username
    provider = Provider.objects.filter(
        contact_email__iexact=user.username, is_active=True, deleted_at__isnull=True
    ).first()
    if provider:
        return provider

    # Check 4: Fallback for admin/staff/dashboard users
    if user.is_staff or user.is_superuser or user.has_permission("provider.dashboard"):
        return Provider.objects.filter(is_active=True, deleted_at__isnull=True).first()

    return None


class IsProviderUser(BasePermission):
    """Permission check for authenticated Provider users (members or admins)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        provider = get_provider_for_user(request.user)
        return provider is not None


class IsProviderAdminOrOwner(BasePermission):
    """Permission check ensuring the provider user has team.manage permission."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.has_permission("team.manage")
