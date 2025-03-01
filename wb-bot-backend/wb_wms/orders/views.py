from rest_framework import viewsets
from .models import Order, Warehouse, Container, Marketplace
from .serializers import OrderSerializer, WarehouseSerializer, MarketplaceSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from django.db.models import Prefetch
import requests
import os
import logging

logger = logging.getLogger(__name__)

class MarketplaceViewSet(viewsets.ModelViewSet):
    queryset = Marketplace.objects.all()
    serializer_class = MarketplaceSerializer
    
    @action(detail=False, methods=['get'])
    def with_warehouses(self, request):
        marketplaces = Marketplace.objects.prefetch_related(
            Prefetch('warehouse_set', queryset=Warehouse.objects.select_related('city'))
        ).all()
        
        data = []
        for marketplace in marketplaces:
            warehouses = [{
                'id': w.id,
                'name': w.name,
                'city': w.city.name
            } for w in marketplace.warehouse_set.all()]
            
            data.append({
                'id': marketplace.id,
                'name': marketplace.name,
                'warehouses': warehouses
            })
            
        return Response(data)

class ContainerTypesViewSet(viewsets.ViewSet):
    def list(self, request):
        data = {
            'box_sizes': [
                {'id': size[0], 'label': size[1]} 
                for size in Container.BOX_SIZES
            ],
            'pallet_weights': [
                {'id': weight[0], 'label': weight[1]} 
                for weight in Container.PALLET_WEIGHT
            ],
            'container_types': [
                {'id': type[0], 'label': type[1]} 
                for type in Container.CONTAINER_TYPES
            ]
        }
        return Response(data)

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    
    def list(self, request):
        warehouses = Warehouse.objects.all()
        serializer = self.serializer_class(warehouses, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            request_data = request.data
            serializer = self.get_serializer(data=request_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            # Безопасно получаем вес паллеты
            selected_pallet_weights = request_data.get('cargoType', {}).get('selectedPalletWeights', [])
            pallet_weight = selected_pallet_weights[0] if selected_pallet_weights else "Не указан"
            
            telegram_data = {
                "order_id": serializer.data.get('id'),
                'warehouse_name': Warehouse.objects.get(id=request_data.get('delivery', {}).get('warehouse')).__str__(),
                'cargo_type': ', '.join(request_data.get('cargoType', {}).get('selectedTypes', [])),
                'box_size': ', '.join(request_data.get('cargoType', {}).get('selectedBoxSizes', [])),
                'box_count': sum(int(qty) for qty in request_data.get('cargoType', {}).get('quantities', {}).values()),
                'pallet_weight': pallet_weight,
                'company_name': request_data.get('clientData', {}).get('companyName', 'Не указана'),
                'client_name': request_data.get('clientData', {}).get('clientName', 'Не указан'),
                'client_email': request_data.get('clientData', {}).get('email', 'Не указан'),
                'client_phone': request_data.get('clientData', {}).get('phone', 'Не указан'),
                "telegram_user_id": request_data.get('clientData', {}).get('telegram_user_id'),
                'cost': request_data.get('clientData', {}).get('cargoValue', 'Не указана'),
                'comments': request_data.get('clientData', {}).get('comments', 'Нет комментариев')
            }
            requests.post("http://telegram-bot:8080/api/send_notification", json=telegram_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def perform_destroy(self, instance):
        instance.delete()
    
    def list(self, request):
        orders = Order.objects.all()
        serializer = self.serializer_class(orders, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        order = self.get_object()
        serializer = self.serializer_class(order)
        return Response(serializer.data)
    
class ContainerTypesViewSet(viewsets.ViewSet):
    def list(self, request):
        data = {
            'box_sizes': [
                {'id': size[0], 'label': size[1]} 
                for size in Container.BOX_SIZES
            ],
            'pallet_weights': [
                {'id': weight[0], 'label': weight[1]} 
                for weight in Container.PALLET_WEIGHT
            ],
            'container_types': [
                {'id': type[0], 'label': type[1]} 
                for type in Container.CONTAINER_TYPES
            ]
        }
        return Response(data)

@api_view(['POST'])
def send_telegram_notification(request):
    """Отправить уведомление в Telegram"""
    try:
        # Получаем данные из запроса
        order_data = request.data
        
        # Отправляем запрос к Telegram боту
        bot_url = os.getenv("TELEGRAM_BOT_URL", "http://telegram-bot:8080")
        response = requests.post(f"{bot_url}/api/send_notification", json=order_data)
        
        if response.status_code == 200:
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "error", "message": response.text}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok"})