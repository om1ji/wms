from django.urls import path
from . import views
from .views import (
    test_pricing,
    AdditionalServiceViewSet
)

app_name = 'orders'

urlpatterns = [
    path('', views.OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='order-list'),
    path('<int:pk>/', views.OrderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='order-detail'),
    path('warehouses/', views.WarehouseViewSet.as_view({'get': 'list'}), name='warehouse-list'),
    path('containers/', views.ContainerTypesViewSet.as_view({'get': 'list'}), name='container-list'),
    path('pricing/', views.PricingViewSet.as_view({'get': 'list', 'post': 'create'}), name='pricing-list'),
    path('pricing/<int:pk>/', views.PricingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pricing-detail'),
    path('calculate-price/', views.PricingViewSet.as_view({'post': 'calculate_price'}), name='calculate-price'),
    path('additional-services/', views.PricingViewSet.as_view({'get': 'get_additional_services'}), name='additional-services'),
    
    # Новые эндпоинты для работы с дополнительными услугами
    path('services/', views.AdditionalServiceViewSet.as_view({'get': 'list', 'post': 'create'}), name='services-list'),
    path('services/<int:pk>/', views.AdditionalServiceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='service-detail'),
    
    path('test-pricing/', test_pricing, name='test-pricing'),
    path('send-telegram-notification/', views.send_telegram_notification, name='send-telegram-notification'),
    path('health/', views.health_check, name='health-check'),
]
