from django.urls import path

from .views import WishlistAddView, WishlistRemoveView, WishlistView

urlpatterns = [
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("wishlist/add/", WishlistAddView.as_view(), name="wishlist-add"),
    path("wishlist/remove/<int:pk>/", WishlistRemoveView.as_view(), name="wishlist-remove"),
]
