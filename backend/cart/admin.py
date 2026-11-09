from django.contrib import admin

from .models import Cart, CartItem, Wishlist, WishlistItem

admin.site.register((Cart, CartItem, Wishlist, WishlistItem))
