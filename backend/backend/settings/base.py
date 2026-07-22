"""
Base Django settings shared across all environments.
Override in dev.py or prod.py for environment-specific settings.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Override in prod.py with environment variable
SECRET_KEY = os.getenv(
    "SECRET_KEY", "django-insecure-0xdp(15^7-ukijszqw3tn2!lf-j9d+*cp)%)#%!l8(awbh!vo9"
)

# SECURITY WARNING: don't run with debug turned on in production!
# Override in dev.py and prod.py
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "api",
    "authentication",
    "booking",
    "content",
    "user",
    "corsheaders",
    "reviews",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Static file serving
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
# Override in dev.py (SQLite) or prod.py (PostgreSQL)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# REST Framework Configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "authentication.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_RATES": {
        "login": "5/min",
        "signup": "5/min",
        "otp": "3/10min",
        "payment": "5/min",
        "booking": "10/min",
        "bulk_booking": "2/min",
        "ticket_validation": "10/min",
    }
}

# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# CORS Configuration
# Override in dev.py and prod.py
CORS_ALLOWED_ORIGINS = []
CORS_ALLOW_CREDENTIALS = True

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# Firebase Configuration
firebase_path_env = os.getenv("FIREBASE_CREDENTIALS_PATH")
if firebase_path_env:
    # If relative, resolve it relative to BASE_DIR
    if not os.path.isabs(firebase_path_env):
        # strip './' or '.\'
        clean_path = firebase_path_env
        if clean_path.startswith("./"):
            clean_path = clean_path[2:]
        elif clean_path.startswith(".\\"):
            clean_path = clean_path[2:]
        FIREBASE_KEY_PATH = BASE_DIR / clean_path
    else:
        FIREBASE_KEY_PATH = Path(firebase_path_env)
else:
    FIREBASE_KEY_PATH = BASE_DIR / "firebase-service-account.json"

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(str(FIREBASE_KEY_PATH))
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Firebase initialization failed: {e}")

# Security Headers (Base, override in prod)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "DEFAULT_SRC": ("'self'",),
    "SCRIPT_SRC": ("'self'", "'unsafe-inline'"),
    "STYLE_SRC": ("'self'", "'unsafe-inline'"),
    "IMG_SRC": ("'self'", "data:", "https:"),
}

# Logging Configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}

ENTERPRISE_BOOKING_LIMIT = 500

