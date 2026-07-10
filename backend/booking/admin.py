from django.contrib import admin
from .models import (
    Booking,
    Ticket,
    Payment,
    Inventory,
    Schedule,
    Seat,
    BulkBookingRequest,
)

myModels = [Booking, Ticket, Payment, Inventory, Schedule, Seat, BulkBookingRequest]

admin.site.register(myModels)

