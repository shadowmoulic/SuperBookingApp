from django.contrib import admin
from .models import User_Data, Enterprise, EnterpriseMember, ProviderMember

myModels = [User_Data, Enterprise, EnterpriseMember, ProviderMember]

admin.site.register(myModels)
