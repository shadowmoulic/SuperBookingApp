from django.contrib import admin
from .models import (
    State,
    City,
    Category,
    Experience,
    PricingRule,
    OperatingHours,
)

admin.site.register([State, City, Category, Experience, PricingRule, OperatingHours])
