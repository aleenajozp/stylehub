from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.text import slugify
from rest_framework import serializers

User = get_user_model()


class RegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, data):
        email = data["email"].strip().lower()
        stem = slugify(email.partition("@")[0])[:140] or "user"
        username, suffix = stem, 1
        while User.objects.filter(username__iexact=username).exists():
            suffix += 1
            username = f"{stem[:149 - len(str(suffix))]}{suffix}"
        names = data["name"].strip().split(maxsplit=1)
        return User.objects.create_user(
            username=username,
            email=email,
            password=data["password"],
            first_name=names[0],
            last_name=names[1] if len(names) > 1 else "",
            role=User.Role.USER,
        )


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "name", "first_name", "last_name")
        read_only_fields = ("id", "username", "name")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "role", "date_joined", "is_active")
        read_only_fields = fields
