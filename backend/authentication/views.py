from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from firebase_admin import auth
import firebase_admin
from user.models import User_Data
import logging
from booking.throttles import LoginRateThrottle, SignupRateThrottle

logger = logging.getLogger(__name__)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def _get_or_create_firebase_user(self, decoded_token):
        email = decoded_token.get("email")
        phone = decoded_token.get("phone_number")
        uid = decoded_token.get("uid")
        name = decoded_token.get("name", "")

        # Determine a unique username (Firebase UID is most reliable)
        username = email or phone or uid

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email or "",
                "first_name": name.split(" ")[0] if name else "",
                "last_name": " ".join(name.split(" ")[1:])
                if name and " " in name
                else "",
            },
        )

        if created:
            user.set_unusable_password()
            user.save()

        # Ensure User_Data profile exists
        User_Data.objects.get_or_create(
            user=user, defaults={"mobile": phone or "", "role": "customer"}
        )
        return user

    def post(self, request):
        firebase_token = request.data.get("firebase_token")
        user = None

        if firebase_token:
            try:
                # Ensure firebase_admin is initialized
                if not firebase_admin._apps:
                    firebase_admin.initialize_app()

                # Add logging for debugging
                logger.info("[Firebase] Attempting to verify token")
                decoded_token = auth.verify_id_token(firebase_token)
                logger.info(
                    f"[Firebase] Token verified successfully for user: {decoded_token.get('email', decoded_token.get('phone_number'))}"
                )
                user = self._get_or_create_firebase_user(decoded_token)
            except ValueError as e:
                # Token format is invalid or malformed
                logger.exception("[Firebase] Token format error")
                return Response(
                    {"detail": "Invalid Firebase token format", "error": str(e)},
                    status=400,
                )
            except Exception as e:
                # Other Firebase errors (expired, wrong project, etc)
                logger.exception("[Firebase] Token verification failed")
                return Response(
                    {"detail": "Firebase authentication failed", "error": str(e)},
                    status=400,
                )
        else:
            username = request.data.get("username")
            password = request.data.get("password")
            user = authenticate(request, username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = Response({"detail": "Login successful"})
            # secure=False is used for local development over HTTP
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=1800,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=86400,
            )
            return response
        return Response({"detail": "Invalid credentials"}, status=400)


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token missing"}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=400)

        response = Response({"detail": "Token refreshed"})
        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=1800,
        )
        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({"detail": "Logout successful"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from authentication.permissions import get_me_response_data
        data = get_me_response_data(request.user)
        return Response(data)

    def patch(self, request):
        from authentication.permissions import get_me_response_data
        user = request.user
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        mobile = request.data.get("mobile")

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        user.save()

        if mobile is not None:
            user_data, _ = User_Data.objects.get_or_create(user=user)
            user_data.mobile = mobile
            user_data.save()

        data = get_me_response_data(user)
        return Response(data)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [SignupRateThrottle]

    def post(self, request):
        # Import here to avoid circular imports
        from api.serializers import UserDataRegisterSerializer

        serializer = UserDataRegisterSerializer(data=request.data)

        if serializer.is_valid():
            user_data = serializer.save()
            auth_user = user_data.user

            # Generate JWT tokens
            refresh = RefreshToken.for_user(auth_user)
            access_token = str(refresh.access_token)

            response = Response(
                {
                    "message": "User registered successfully",
                    "access_token": access_token,
                    "user": {
                        "id": auth_user.id,
                        "username": auth_user.username,
                        "email": auth_user.email,
                        "first_name": auth_user.first_name,
                        "last_name": auth_user.last_name,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

            # Set cookies for session persistence
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=1800,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=86400,
            )

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
