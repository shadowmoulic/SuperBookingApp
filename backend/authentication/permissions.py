# Centralized Permission Constants
BOOKING_VALIDATE = "booking.validate"
BOOKING_BULK = "booking.bulk"
ANALYTICS_VIEW = "analytics.view"

# Optional/future permission constants
EXPERIENCE_CREATE = "experience.create"
EXPERIENCE_UPDATE = "experience.update"
EXPERIENCE_DELETE = "experience.delete"
PROVIDER_DASHBOARD = "provider.dashboard"
ENTERPRISE_DASHBOARD = "enterprise.dashboard"
TEAM_MANAGE = "team.manage"
PRICING_MANAGE = "pricing.manage"

PROVIDER_ROLE_PERMISSIONS = {
    "owner": [
        BOOKING_VALIDATE,
        ANALYTICS_VIEW,
        TEAM_MANAGE,
        PROVIDER_DASHBOARD,
        "provider.settings",
    ],
    "admin": [
        BOOKING_VALIDATE,
        ANALYTICS_VIEW,
        TEAM_MANAGE,
        PROVIDER_DASHBOARD,
    ],
    "manager": [
        BOOKING_VALIDATE,
        ANALYTICS_VIEW,
        PROVIDER_DASHBOARD,
    ],
    "staff": [
        BOOKING_VALIDATE,
        ANALYTICS_VIEW,
    ],
    "viewer": [
        ANALYTICS_VIEW,
    ],
}

ENTERPRISE_ROLE_PERMISSIONS = {
    "owner": [
        BOOKING_BULK,
        ENTERPRISE_DASHBOARD,
        TEAM_MANAGE,
    ],
    "admin": [
        BOOKING_BULK,
        ENTERPRISE_DASHBOARD,
        TEAM_MANAGE,
    ],
    "booking_manager": [
        BOOKING_BULK,
    ],
    "finance": [],
    "viewer": [],
}


def get_user_permissions(user):
    """Retrieve union of all permissions based on the user's active memberships."""
    if not user or not user.is_authenticated:
        return []

    # django staff or superuser gets all defined permissions
    if user.is_staff or user.is_superuser:
        all_perms = set()
        for perms in PROVIDER_ROLE_PERMISSIONS.values():
            all_perms.update(perms)
        for perms in ENTERPRISE_ROLE_PERMISSIONS.values():
            all_perms.update(perms)
        return list(all_perms)

    try:
        user_data = user.user_data
    except Exception:
        return []

    permissions = set()

    # Provider memberships permissions
    active_provider_memberships = user_data.provider_memberships.filter(
        provider__is_active=True, provider__deleted_at__isnull=True
    )
    for pm in active_provider_memberships:
        permissions.update(PROVIDER_ROLE_PERMISSIONS.get(pm.role, []))

    # Enterprise memberships permissions
    active_enterprise_memberships = user_data.enterprise_memberships.filter(
        enterprise__is_active=True
    )
    for em in active_enterprise_memberships:
        permissions.update(ENTERPRISE_ROLE_PERMISSIONS.get(em.role, []))

    return list(permissions)


def get_user_memberships_and_permissions(user):
    """Retrieve detailed provider and enterprise memberships and their roles/permissions."""
    if not user or not user.is_authenticated:
        return {
            "provider": [],
            "enterprise": []
        }

    try:
        user_data = user.user_data
    except Exception:
        return {
            "provider": [],
            "enterprise": []
        }

    provider_list = []
    active_provider_memberships = user_data.provider_memberships.filter(
        provider__is_active=True, provider__deleted_at__isnull=True
    )
    for pm in active_provider_memberships:
        provider_list.append({
            "provider_id": pm.provider.id,
            "provider_name": pm.provider.name,
            "role": pm.role,
            "permissions": PROVIDER_ROLE_PERMISSIONS.get(pm.role, [])
        })

    # For admin/superuser fallback if no provider memberships exist
    if not provider_list and (user.is_staff or user.is_superuser):
        from content.models import Provider
        fallback = Provider.objects.filter(is_active=True, deleted_at__isnull=True).first()
        if fallback:
            provider_list.append({
                "provider_id": fallback.id,
                "provider_name": fallback.name,
                "role": "admin",
                "permissions": PROVIDER_ROLE_PERMISSIONS.get("admin", [])
            })

    enterprise_list = []
    active_enterprise_memberships = user_data.enterprise_memberships.filter(
        enterprise__is_active=True
    )
    for em in active_enterprise_memberships:
        enterprise_list.append({
            "enterprise_id": em.enterprise.id,
            "enterprise_name": em.enterprise.organization_name,
            "role": em.role,
            "permissions": ENTERPRISE_ROLE_PERMISSIONS.get(em.role, [])
        })

    return {
        "provider": provider_list,
        "enterprise": enterprise_list
    }


def user_has_permission(self, permission):
    """Django User model extension to check resolved custom permissions."""
    if self.is_superuser or self.is_staff:
        return True
    return permission in get_user_permissions(self)


def get_me_response_data(user):
    """Generate standardized auth/me response dictionary."""
    mobile = ""
    try:
        mobile = user.user_data.mobile
    except Exception:
        pass

    memberships = get_user_memberships_and_permissions(user)
    resolved_permissions = get_user_permissions(user)

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "mobile": mobile,
        },
        "memberships": memberships,
        "permissions": resolved_permissions
    }
