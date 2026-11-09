from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from accounts.permissions import IsAdminRole

from .models import Category, Product
from .permissions import IsAdminOrReadOnly
from .serializers import CategorySerializer, ProductSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Product.objects.select_related("category").all()

    def get_queryset(self):
        queryset = super().get_queryset()
        gender, category = self.request.query_params.get("gender"), self.request.query_params.get("category")
        if gender:
            queryset = queryset.filter(gender__iexact=gender)
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = Product.objects.select_related("category").all()


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method == "GET" else [IsAdminRole()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        if instance.products.exists():
            raise ValidationError({"detail": "Move or delete category products before deleting it."})
        instance.delete()
