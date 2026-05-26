"""
Django settings for SuperBookingApp backend.

This module dynamically loads the appropriate settings based on the DJANGO_SETTINGS_MODULE
environment variable or defaults to development settings.

Usage:
  - Development: DJANGO_SETTINGS_MODULE=backend.settings.dev python manage.py runserver
  - Production: DJANGO_SETTINGS_MODULE=backend.settings.prod python manage.py runserver
  - Default (if not set): backend.settings.dev
"""

import os

# Determine which settings module to load
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DJANGO_SETTINGS = os.getenv("DJANGO_SETTINGS_MODULE", "").lower()

# Auto-detect based on environment variable if DJANGO_SETTINGS_MODULE not explicitly set
if not DJANGO_SETTINGS:
    if ENVIRONMENT in ["production", "prod"]:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings.prod")
    else:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings.dev")
