from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "unit_price", "size", "quantity", "line_total")
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = ("id", "user", "user_email", "items", "total_amount", "delivery_address",
                  "phone_number", "payment_status", "order_status", "created_at")
        read_only_fields = fields


class PlaceOrderSerializer(serializers.Serializer):
    delivery_address = serializers.CharField(max_length=2000)
    phone_number = serializers.CharField(max_length=30)

    def validate_delivery_address(self, value):
        if not value.strip():
            raise serializers.ValidationError("Delivery address cannot be empty.")
        return value.strip()

    def validate_phone_number(self, value):
        value = value.strip()
        if len(value) < 7 or not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("order_status",)
