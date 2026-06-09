from django.contrib import admin
from .models import (
    Booking,
    Ticket,
    Payment,
    Inventory,
)

myModels = [Booking, Ticket, Payment, Inventory]

admin.site.register(myModels)

