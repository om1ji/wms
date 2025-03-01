from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='order-list'),
    path('<int:pk>/', views.OrderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='order-detail'),
    path('warehouses/', views.WarehouseViewSet.as_view({'get': 'list'}), name='warehouse-list'),
    path('containers/', views.ContainerTypesViewSet.as_view({'get': 'list'}), name='container-list'),
    path('send-telegram-notification/', views.send_telegram_notification, name='send-telegram-notification'),
    path('health/', views.health_check, name='health-check'),
]
