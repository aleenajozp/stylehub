from django.contrib import admin

from .models import Category, Product

admin.site.register(Category)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "gender", "price", "stock_quantity", "created_at")
    list_filter = ("category", "gender")
    search_fields = ("name", "description")
