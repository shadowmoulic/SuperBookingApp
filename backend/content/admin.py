from django.contrib import admin
from .models import (
    State,
    City,
    Category,
    Experience,
    PricingRule,
    OperatingHours,
    OperatingException,
    Provider,
    TicketType,
    Collection,
    CollectionExperience,
    BookingPolicy,
    TicketFeature,
    ExperienceHighlight,
    ExperienceAttribute,
    ProviderBookingConfiguration
)

myModels = [
    State,
    City,
    Category,
    Experience,
    PricingRule,
    OperatingHours,
    OperatingException,
    Provider,
    TicketType,
    Collection,
    CollectionExperience,
    BookingPolicy,
    TicketFeature,
    ExperienceHighlight,
    ExperienceAttribute,
    ProviderBookingConfiguration
]

admin.site.register(myModels)
