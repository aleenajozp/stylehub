from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdminRole
from .serializers import AdminUserSerializer, ProfileSerializer, RegistrationSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except IntegrityError:
            return Response({"detail": "An account with these details already exists."},
                            status=status.HTTP_409_CONFLICT)
        return Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier, password = request.data.get("username") or request.data.get("email"), request.data.get("password")
        if not identifier or not password:
            return Response({"detail": "Username or email and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)
        username = identifier
        if "@" in identifier:
            matched = User.objects.filter(email__iexact=identifier).only("username").first()
            username = matched.username if matched else ""
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid username/email or password."},
                            status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": ProfileSerializer(user).data,
            "role": user.role,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh")
        if not token:
            return Response({"detail": "The refresh token is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(token).blacklist()
        except TokenError:
            return Response({"detail": "The refresh token is invalid or expired."},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out successfully."})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.order_by("-date_joined")
