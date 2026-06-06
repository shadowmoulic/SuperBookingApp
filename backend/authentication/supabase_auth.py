import os
import jwt
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        if not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            secret = os.getenv("SUPABASE_JWT_SECRET")
            if not secret:
                raise exceptions.AuthenticationFailed("SUPABASE_JWT_SECRET is not configured on the server.")
                
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired.")
        except jwt.DecodeError:
            raise exceptions.AuthenticationFailed("Token is invalid.")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Authentication failed: {str(e)}")
            
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise exceptions.AuthenticationFailed("User identifier not found in token.")
            
        try:
            user = User.objects.get(username=user_id)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=user_id,
                email=email or "",
                password=None
            )
            
        return (user, token)
