from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from cart.models import Cart
from products.models import Product

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderStatusSerializer, PlaceOrderSerializer


class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_object_or_404(Cart, user=request.user)
        with transaction.atomic():
            items = list(cart.items.select_for_update().select_related("product").order_by("pk"))
            if not items:
                raise serializers.ValidationError({"detail": "Your cart is empty."})
            products = {
                product.pk: product
                for product in Product.objects.select_for_update().filter(pk__in=[i.product_id for i in items])
            }
            total, lines = 0, []
            for item in items:
                product = products.get(item.product_id)
                if product is None or item.quantity > product.stock_quantity:
                    raise serializers.ValidationError({"detail": f"Insufficient stock for {item.product.name}."})
                total += product.price * item.quantity
                lines.append((item, product))
            order = Order.objects.create(user=request.user, total_amount=total, **serializer.validated_data)
            for item, product in lines:
                OrderItem.objects.create(order=order, product=product, product_name=product.name,
                                         unit_price=product.price, size=item.size, quantity=item.quantity)
                product.stock_quantity -= item.quantity
                product.save(update_fields=["stock_quantity"])
            cart.items.all().delete()
        order = Order.objects.prefetch_related("items").get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]
    queryset = Order.objects.select_related("user").prefetch_related("items")


class AdminOrderStatusView(generics.UpdateAPIView):
    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminRole]
    queryset = Order.objects.all()
    http_method_names = ["put", "patch", "head", "options"]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        order = Order.objects.select_related("user").prefetch_related("items").get(pk=instance.pk)
        return Response(OrderSerializer(order).data)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        stats = Order.objects.aggregate(order_count=Count("id"), sales_total=Sum("total_amount"))
        return Response({
            "product_count": Product.objects.count(),
            "user_count": get_user_model().objects.filter(role="user").count(),
            "order_count": stats["order_count"],
            "sales_total": stats["sales_total"] or 0,
        })
