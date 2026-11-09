from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from products.serializers import ProductSerializer

from .models import Cart, CartItem, Wishlist, WishlistItem
from .serializers import CartItemSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("product", "product__category"))
        total = sum((item.product.price * item.quantity for item in items), start=0)
        return Response({"items": CartItemSerializer(items, many=True).data, "total": total})


class CartAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if product_id is None:
            raise serializers.ValidationError({"product_id": "This field is required."})
        product = get_object_or_404(Product, pk=product_id)
        size, quantity = request.data.get("size", ""), request.data.get("quantity", 1)
        if not isinstance(size, str):
            raise serializers.ValidationError({"size": "Size must be a string."})
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
            raise serializers.ValidationError({"quantity": "Quantity must be a positive integer."})
        if product.sizes and size not in product.sizes:
            raise serializers.ValidationError({"size": "Choose an available product size."})
        cart, _ = Cart.objects.get_or_create(user=request.user)
        with transaction.atomic():
            item, created = CartItem.objects.select_for_update().get_or_create(
                cart=cart, product=product, size=size, defaults={"quantity": quantity}
            )
            new_quantity = quantity if created else item.quantity + quantity
            if new_quantity > product.stock_quantity:
                raise serializers.ValidationError({"quantity": "Requested quantity exceeds available stock."})
            if not created:
                item.quantity = new_quantity
                item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        product_id, size, quantity = request.data.get("product_id"), request.data.get("size", ""), request.data.get("quantity")
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
            raise serializers.ValidationError({"quantity": "Quantity must be a positive integer."})
        item = get_object_or_404(
            CartItem.objects.select_related("product", "product__category"),
            cart__user=request.user, product_id=product_id, size=size,
        )
        if quantity > item.product.stock_quantity:
            raise serializers.ValidationError({"quantity": "Requested quantity exceeds available stock."})
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item).data)


class CartRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        items = CartItem.objects.filter(cart__user=request.user, product_id=pk)
        if "size" in request.query_params:
            items = items.filter(size=request.query_params["size"])
        if not items.exists():
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        items.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        products = Product.objects.filter(wishlist_items__wishlist=wishlist).select_related("category").distinct()
        return Response(ProductSerializer(products, many=True).data)


class WishlistAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if product_id is None:
            raise serializers.ValidationError({"product_id": "This field is required."})
        product = get_object_or_404(Product, pk=product_id)
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        try:
            WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        except IntegrityError:
            pass
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class WishlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = WishlistItem.objects.filter(wishlist__user=request.user, product_id=pk).delete()
        if not deleted:
            return Response({"detail": "Wishlist item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
