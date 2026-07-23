from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    name = 'authentication'

    def ready(self):
        from django.contrib.auth.models import User
        from authentication.permissions import user_has_permission
        User.add_to_class("has_permission", user_has_permission)
