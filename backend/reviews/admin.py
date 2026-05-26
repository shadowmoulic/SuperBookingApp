from django.contrib import admin
from .models import Review

myModels = [Review]

admin.site.register(myModels)
