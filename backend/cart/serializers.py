from rest_framework import serializers

from products.serializers import ProductSerializer

from .models import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_data = ProductSerializer(source="product", read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ("product_data", "size", "quantity", "line_total")

    def get_line_total(self, item):
        return item.product.price * item.quantity

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {**data.pop("product_data"), **data}
