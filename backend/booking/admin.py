from django.contrib import admin
from .models import (
    Booking,
    BookingItem,
    Ticket,
    Payment,
    Inventory,
    Schedule,
    TicketTypeSchedule,
    Seat,
    BulkBookingRequest,
)

myModels = [Booking, BookingItem, Ticket, Payment, Inventory, Schedule, TicketTypeSchedule, Seat, BulkBookingRequest]

admin.site.register(myModels)

