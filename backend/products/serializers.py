from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "created_at")
        read_only_fields = ("id", "slug", "created_at")


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field="name", queryset=Category.objects.all())
    type = serializers.CharField(source="product_type", required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "category", "gender", "type",
                  "sizes", "color", "stock_quantity", "image", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_sizes(self, value):
        if not isinstance(value, list) or not all(isinstance(s, str) and s.strip() for s in value):
            raise serializers.ValidationError("Sizes must be a list of non-empty strings.")
        return [s.strip() for s in value]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
