from django.contrib import admin
from .models import (
    Location,
    Category,
    Experience,
    PricingRule,
    OperatingHours,
    Provider,
    TicketType,
    Collection,
    CollectionExperience,
)

myModels = [
    Location,
    Category,
    Experience,
    PricingRule,
    OperatingHours,
    Provider,
    TicketType,
    Collection,
    CollectionExperience,
]

admin.site.register(myModels)

