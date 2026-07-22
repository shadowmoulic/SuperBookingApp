from django.contrib import admin
from .models import User_Data, Enterprise, EnterpriseMember

myModels = [User_Data, Enterprise, EnterpriseMember]

admin.site.register(myModels)
