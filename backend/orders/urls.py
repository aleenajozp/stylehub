from django.urls import path

from .views import AdminDashboardView, AdminOrderListView, AdminOrderStatusView, MyOrdersView, PlaceOrderView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("", AdminOrderListView.as_view(), name="admin-orders"),
    path("<int:pk>/status/", AdminOrderStatusView.as_view(), name="admin-order-status"),
]
