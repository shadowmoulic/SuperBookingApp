"""
Production Django settings.
Extends base.py with production-safe configurations.
Uses environment variables for all sensitive data.
"""

import os
from .base import *  # noqa: F401, F403

# Production Settings
DEBUG = False

# SECURITY: Must be explicitly set in production
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",") or ["api.zeque.in"]

# Production Database (PostgreSQL via DATABASE_URL)
if os.getenv("DATABASE_URL"):
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL"),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fallback: PostgreSQL without DATABASE_URL env var
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "superbooking"),
            "USER": os.getenv("POSTGRES_USER", "postgres"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
            "HOST": os.getenv("POSTGRES_HOST", "localhost"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
            "ATOMIC_REQUESTS": True,
            "CONN_MAX_AGE": 600,
            "CONN_HEALTH_CHECKS": True,
        }
    }

# Production CORS (only allow production domains)
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") or [
    "https://zeque.in",
    "https://www.zeque.in",
]

# Production Razorpay (live keys from environment variables)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise ValueError(
        "Razorpay keys must be set in environment variables for production!"
    )

# Production API URL (for frontend to know where to call)
API_URL = os.getenv("API_URL", "https://api.zeque.in")

# Production Security Headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "DEFAULT_SRC": ("'self'",),
    "SCRIPT_SRC": ("'self'", "'unsafe-inline'"),  # Consider removing unsafe-inline
    "STYLE_SRC": ("'self'", "'unsafe-inline'"),  # Consider removing unsafe-inline
    "IMG_SRC": ("'self'", "data:", "https:"),
    "FONT_SRC": ("'self'", "https:"),
    "CONNECT_SRC": ("'self'", "https:"),
}

# Production REST Framework with rate limiting
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "authentication.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "5/min",
        "signup": "5/min",
        "otp": "3/10min",
        "payment": "5/min",
        "booking": "10/min",
        "bulk_booking": "2/min",
        "ticket_validation": "10/min",
    },
}

# WhiteNoise Static File Serving (already in MIDDLEWARE from base)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Production Logging (to stdout for container logs)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# Sentry Integration (Optional - for error tracking)
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )

# Health check endpoint (used by Render, AWS, etc.)
HEALTH_CHECK_ENDPOINT = "/health/"
