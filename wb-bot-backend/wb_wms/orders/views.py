from rest_framework import viewsets
from .models import Order, Warehouse, Container, Marketplace, Pricing, AdditionalService
from .serializers import (
    OrderSerializer, 
    WarehouseSerializer, 
    MarketplaceSerializer, 
    PricingSerializer,
    AdditionalServiceSerializer
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view
from django.db.models import Prefetch, Sum, F, ExpressionWrapper, DecimalField
from decimal import Decimal
import requests
import os
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import connection
import datetime
import uuid
from django.views.decorators.http import require_http_methods
import traceback

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
            
            # Получаем данные о созданном заказе
            order_id = serializer.data.get('id')
            warehouse_name = ""
            if 'delivery' in request_data and 'warehouse' in request_data['delivery']:
                try:
                    warehouse_id = request_data['delivery']['warehouse']
                    warehouse = Warehouse.objects.get(id=warehouse_id)
                    warehouse_name = str(warehouse)
                except Warehouse.DoesNotExist:
                    warehouse_name = "Не указан"
            
            # Собираем информацию о грузе
            cargo_type_data = request_data.get('cargoType', {})
            cargo_types = cargo_type_data.get('selectedTypes', [])
            cargo_type_str = ', '.join(cargo_types) if cargo_types else "Не указан"
            
            # Получаем информацию о размерах коробок (если есть)
            box_sizes = cargo_type_data.get('selectedBoxSizes', [])
            box_size_str = ', '.join(box_sizes) if box_sizes else "Не указан"
            
            # Получаем количество коробок
            box_count = 0
            if 'quantities' in cargo_type_data and 'Коробка' in cargo_type_data['quantities']:
                try:
                    box_count = int(cargo_type_data['quantities']['Коробка'])
                except (ValueError, TypeError):
                    box_count = 0
            
            # Получаем информацию о весе паллет (если есть)
            pallet_weights = cargo_type_data.get('selectedPalletWeights', [])
            pallet_weight_str = ', '.join(pallet_weights) if pallet_weights else "Не указан"
            
            # Получаем количество паллет
            pallet_count = 0
            if 'quantities' in cargo_type_data and 'Паллета' in cargo_type_data['quantities']:
                try:
                    pallet_count = int(cargo_type_data['quantities']['Паллета'])
                except (ValueError, TypeError):
                    pallet_count = 0
            
            # Получаем информацию о клиенте
            client_data = request_data.get('clientData', {})
            client_name = client_data.get('clientName', 'Не указан')
            phone = client_data.get('phone', 'Не указан')
            company_name = client_data.get('companyName', 'Не указана')
            email = client_data.get('email', 'Не указан')
            
            # Получаем адрес самовывоза (если есть)
            pickup_address = request_data.get('pickupAddress', '')
            
            # Формируем данные для уведомления в Telegram
            telegram_data = {
                "order_id": order_id,
                'warehouse_name': warehouse_name,
                'cargo_type': cargo_type_str,
                'box_size': box_size_str,
                'box_count': box_count,
                'pallet_weight': pallet_weight_str,
                'pallet_count': pallet_count,
                'company_name': company_name,
                'client_name': client_name,
                'client_email': email,
                'client_phone': phone,
                "telegram_user_id": client_data.get('telegram_user_id'),
                'cost': serializer.data.get('total_price', 'Не указана'),
                'comments': client_data.get('comments', 'Нет комментариев'),
                'pickup_address': pickup_address
            }
            
            # Отправляем уведомление в Telegram
            try:
                requests.post("http://telegram-bot:8080/api/send_notification", json=telegram_data)
            except Exception as e:
                print(f"Error sending Telegram notification: {str(e)}")
            
            # Рассчитываем стоимость заказа
            box_price = 500.00  # Стоимость одной коробки
            pallet_price = 2000.00  # Стоимость одной паллеты
            base_price = 1000.00  # Базовая стоимость заказа
            
            total_price = base_price + (box_count * box_price) + (pallet_count * pallet_price)
            
            # Получаем текущие дату/время
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Сохраняем информацию о грузе и клиенте в JSON-поле
            additional_info = {
                'cargo_info': cargo_type_data,
                'client_info': client_data
            }
            
            # Это минимальный набор полей для создания заказа
            with connection.cursor() as cursor:
                # Форматируем строки для прямого вставления в SQL
                now_str = f"'{now}'"
                total_price_str = f"'{str(total_price)}'"
                status_str = "'new'"
                # Используем более простой подход к экранированию кавычек
                json_str = json.dumps(additional_info)
                json_str = json_str.replace("'", "''")
                additional_info_str = f"'{json_str}'"
                user_id_str = '1'
                warehouse_id_str = f"{warehouse_id if warehouse_id is not None else 'NULL'}"
                pickup_address_str = f"'{pickup_address}'" if pickup_address else "NULL"
                
                # Прямой SQL запрос без плейсхолдеров
                direct_sql = f"""
                INSERT INTO orders_order (
                    created_at, cost, status, additional_info, status_updated_at, 
                    user_id_id, warehouse_id_id, pickup_address
                ) VALUES (
                    {now_str}, {total_price_str}, {status_str}, {additional_info_str}, {now_str}, 
                    {user_id_str}, {warehouse_id_str}, {pickup_address_str}
                )
                """
                
                print(f"DEBUG: Direct SQL: {direct_sql}")
                cursor.execute(direct_sql)
                
                # Получаем ID созданного заказа
                cursor.execute("SELECT last_insert_rowid()")
                order_id = cursor.fetchone()[0]
            
            # Формируем ответ
            return JsonResponse({
                'success': True,
                'message': 'Order created successfully',
                'order': {
                    'id': order_id,
                    'status': 'new',
                    'total_price': str(total_price),
                    'created_at': now,
                    'warehouse_id': warehouse_id,
                    'pickup_address': pickup_address,
                    'client': {
                        'name': client_data.get('clientName', ''),
                        'phone': client_data.get('phone', '')
                    },
                    'pricing': {
                        'base_price': str(base_price),
                        'box_price': {
                            'per_unit': str(box_price),
                            'quantity': box_count,
                            'total': str(box_count * box_price)
                        },
                        'pallet_price': {
                            'per_unit': str(pallet_price),
                            'quantity': pallet_count,
                            'total': str(pallet_count * pallet_price)
                        }
                    }
                }
            }, status=201)
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

class PricingViewSet(viewsets.ModelViewSet):
    queryset = Pricing.objects.all()
    serializer_class = PricingSerializer
    
    @action(detail=False, methods=['post'])
    def calculate_price(self, request):
        """Рассчитать стоимость заказа на основе переданных данных формы"""
        try:
            # Извлекаем данные
            delivery_data = request.data.get('delivery', {})
            # Check for cargo data in both formats (cargoType and cargo)
            cargo_type_data = request.data.get('cargoType', request.data.get('cargo', {}))
            additional_services = request.data.get('additionalServices', [])
            
            # Log the received data for debugging
            logger.info(f"Received price calculation request: {request.data}")
            logger.info(f"Extracted cargo data: {cargo_type_data}")
            
            total_price = Decimal('0.00')
            
            # 1. Расчет стоимости доставки
            delivery_price = Decimal('0.00')
            if delivery_data:
                warehouse_id = delivery_data.get('warehouse_id') or delivery_data.get('warehouse')
                if warehouse_id:
                    try:
                        # Ищем тариф доставки для выбранного склада
                        delivery_pricing = Pricing.objects.filter(
                            pricing_type='delivery',
                            warehouse__id=warehouse_id,
                            is_active=True
                        ).first()
                        
                        # If no pricing found for specific warehouse, use any delivery pricing
                        if not delivery_pricing:
                            delivery_pricing = Pricing.objects.filter(
                                pricing_type='delivery',
                                is_active=True
                            ).first()
                            logger.info(f"No specific delivery pricing found for warehouse {warehouse_id}, using first available")
                        
                        if delivery_pricing:
                            delivery_price = delivery_pricing.base_price
                            total_price += delivery_price
                            logger.info(f"Added delivery price: {delivery_price} using pricing {delivery_pricing.id}")
                        else:
                            # Если тариф не найден, используем базовую стоимость
                            delivery_price = Decimal('2000.00')
                            total_price += delivery_price
                    except Exception as e:
                        logger.error(f"Error calculating delivery price: {str(e)}")
                        # Если тариф не найден, используем базовую стоимость
                        delivery_price = Decimal('2000.00')
                        total_price += delivery_price
            
            # 2. Расчет стоимости по типу груза
            if cargo_type_data:
                # Determine cargo type and counts
                cargo_type = cargo_type_data.get('cargo_type', '')
                box_count = int(cargo_type_data.get('box_count', 0))
                pallet_count = int(cargo_type_data.get('pallet_count', 0))
                container_type = cargo_type_data.get('container_type', '')
                
                logger.info(f"Processing cargo: type={cargo_type}, box_count={box_count}, pallet_count={pallet_count}")
                
                # Process boxes
                if box_count > 0:
                    # Ищем тариф для коробок указанного размера
                    box_pricing = None
                    if container_type:
                        box_pricing = Pricing.objects.filter(
                            pricing_type='box',
                            specification=container_type,
                            is_active=True
                        ).first()
                    
                    if not box_pricing:
                        # If no specific pricing found, get the first available box pricing
                        box_pricing = Pricing.objects.filter(
                            pricing_type='box',
                            is_active=True
                        ).first()
                    
                    if box_pricing:
                        # Базовая цена + (цена за единицу * количество)
                        box_cost = box_pricing.base_price + (box_pricing.unit_price * Decimal(box_count))
                        total_price += box_cost
                        logger.info(f"Added box price: {box_cost} for {box_count} boxes using pricing {box_pricing.id}")
                    else:
                        # Если тариф не найден, используем базовую стоимость
                        box_cost = Decimal('500.00') * Decimal(box_count)
                        total_price += box_cost
                        logger.info(f"Using default box price: {box_cost} for {box_count} boxes (no pricing found)")
                
                # Process pallets
                if pallet_count > 0:
                    # Ищем тариф для паллет указанной весовой категории
                    pallet_pricing = None
                    if container_type:
                        pallet_pricing = Pricing.objects.filter(
                            pricing_type='pallet',
                            specification=container_type,
                            is_active=True
                        ).first()
                    
                    if not pallet_pricing:
                        # If no specific pricing found, get the first available pallet pricing
                        pallet_pricing = Pricing.objects.filter(
                            pricing_type='pallet',
                            is_active=True
                        ).first()
                    
                    if pallet_pricing:
                        # Базовая цена + (цена за единицу * количество)
                        pallet_cost = pallet_pricing.base_price + (pallet_pricing.unit_price * Decimal(pallet_count))
                        total_price += pallet_cost
                        logger.info(f"Added pallet price: {pallet_cost} for {pallet_count} pallets using pricing {pallet_pricing.id}")
                    else:
                        # Если тариф не найден, используем базовую стоимость
                        pallet_cost = Decimal('2000.00') * Decimal(pallet_count)
                        total_price += pallet_cost
                        logger.info(f"Using default pallet price: {pallet_cost} for {pallet_count} pallets (no pricing found)")
                
                # If neither box nor pallet count is provided but we have a cargo type
                if box_count == 0 and pallet_count == 0:
                    # Default to 1 unit of the specified cargo type
                    if cargo_type == 'box':
                        total_price += Decimal('500.00')
                        logger.info("Using default box price for unspecified count: 500.00")
                    elif cargo_type == 'pallet':
                        total_price += Decimal('2000.00')
                        logger.info("Using default pallet price for unspecified count: 2000.00")
            
            # 3. Расчет стоимости дополнительных услуг
            additional_services_cost = Decimal('0.00')
            for service_id in additional_services:
                try:
                    # Try to find the service in the new AdditionalService model
                    service = AdditionalService.objects.filter(id=service_id, is_active=True).first()
                    if service:
                        additional_services_cost += service.price
                        logger.info(f"Added additional service price: {service.price} for {service.name}")
                    else:
                        # Fall back to the old Pricing model
                        service_pricing = Pricing.objects.filter(
                            pricing_type='additional',
                            id=service_id,
                            is_active=True
                        ).first()
                        
                        if service_pricing:
                            additional_services_cost += service_pricing.base_price
                            logger.info(f"Added legacy additional service price: {service_pricing.base_price}")
                except Exception as e:
                    logger.error(f"Error processing additional service {service_id}: {str(e)}")
            
            total_price += additional_services_cost
            
            # Округляем до 2 знаков после запятой
            total_price = total_price.quantize(Decimal('0.01'))
            
            logger.info(f"Final calculated price: {total_price}")
            
            # Prepare pricing details
            cargo_price = total_price - delivery_price - additional_services_cost
            
            return Response({
                'total_price': total_price,
                'currency': 'RUB',
                'details': {
                    'delivery': str(delivery_price),
                    'cargo': str(cargo_price),
                    'additional_services': str(additional_services_cost)
                }
            })
        except Exception as e:
            logger.error(f"Error calculating price: {str(e)}")
            return Response(
                {"error": f"Error calculating price: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def get_additional_services(self, request):
        """
        Получение списка дополнительных услуг, сгруппированных по категориям
        """
        # Получаем все активные дополнительные услуги
        services = AdditionalService.objects.filter(is_active=True)
        
        # Группируем услуги по типам
        service_groups = []
        
        # Получаем все возможные типы услуг из модели
        service_types = dict(AdditionalService.SERVICE_TYPES)
        
        # Для каждого типа услуг создаем группу
        for service_type, type_display in service_types.items():
            # Получаем услуги данного типа
            type_services = services.filter(service_type=service_type)
            
            # Если есть услуги данного типа, добавляем группу
            if type_services.exists():
                service_group = {
                    'title': type_display,
                    'services': []
                }
                
                # Добавляем каждую услугу в группу
                for service in type_services:
                    service_group['services'].append({
                        'id': service.id,
                        'name': service.name,
                        'price': f"{service.price} ₽",
                        'requires_location': service.requires_location,
                        'description': service.description
                    })
                
                service_groups.append(service_group)
        
        # Добавляем услуги без типа в отдельную группу
        other_services = services.filter(service_type__isnull=True)
        if other_services.exists():
            other_group = {
                'title': 'Другие услуги',
                'services': []
            }
            
            for service in other_services:
                other_group['services'].append({
                    'id': service.id,
                    'name': service.name,
                    'price': f"{service.price} ₽",
                    'requires_location': service.requires_location,
                    'description': service.description
                })
            
            service_groups.append(other_group)
        
        return Response({
            'serviceGroups': service_groups
        })

class AdditionalServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления дополнительными услугами
    """
    queryset = AdditionalService.objects.all()
    serializer_class = AdditionalServiceSerializer
    
    def get_queryset(self):
        """
        Опционально фильтрует услуги по типу или активности
        """
        queryset = AdditionalService.objects.all()
        
        # Фильтрация по типу услуги
        service_type = self.request.query_params.get('type', None)
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        
        # Фильтрация по активности
        is_active = self.request.query_params.get('active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
def create_order(request):
    """
    Непосредственное создание заказа через SQL запрос
    """
    try:
        # Проверка метода запроса
        if request.method != 'POST':
            return JsonResponse({
                'success': False,
                'message': 'Method not allowed',
            }, status=405)
            
        import datetime
        from orders.models import Warehouse, Pricing
        
        # Получение данных заказа
        try:
            order_data = json.loads(request.body.decode('utf-8'))
            logging.info(f"Received order data: {order_data}")
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON',
            }, status=400)
        
        # Проверка обязательных полей
        delivery_data = order_data.get('delivery', {})
        cargo_data = order_data.get('cargo', {})
        client_data = order_data.get('client', {})
        pickup_address = order_data.get('pickup_address', '')
        
        # Расчет стоимости заказа
        # Базовая стоимость
        base_price = Decimal('1000.00')
        total_price = base_price
        box_price_per_unit = Decimal('500.00')
        pallet_price_per_unit = Decimal('2000.00')
        box_quantity = int(cargo_data.get('box_count', 0))
        pallet_quantity = int(cargo_data.get('pallet_count', 0))
        box_total = Decimal('0.00')
        pallet_total = Decimal('0.00')
        
        # Получаем идентификатор склада
        warehouse_id = delivery_data.get('warehouse_id')
        
        # Расчет стоимости доставки
        delivery_price = Decimal('0.00')
        if warehouse_id:
            try:
                delivery_pricing = Pricing.objects.filter(
                    pricing_type='delivery',
                    warehouse__id=warehouse_id,
                    is_active=True
                ).first()
                
                # If no pricing found for specific warehouse, use any delivery pricing
                if not delivery_pricing:
                    delivery_pricing = Pricing.objects.filter(
                        pricing_type='delivery',
                        is_active=True
                    ).first()
                
                if delivery_pricing:
                    delivery_price = delivery_pricing.base_price
                    base_price = delivery_price
                    total_price = delivery_price
            except Exception as e:
                logging.error(f"Error calculating delivery price: {str(e)}")
        
        # Расчет стоимости коробок
        cargo_type = cargo_data.get('cargo_type', '')
        container_type = cargo_data.get('container_type', '')
        
        if box_quantity > 0:
            # Ищем тариф для коробок
            box_pricing = None
            if container_type:
                box_pricing = Pricing.objects.filter(
                    pricing_type='box',
                    specification=container_type,
                    is_active=True
                ).first()
            
            if not box_pricing:
                # If no specific pricing found, get the first available box pricing
                box_pricing = Pricing.objects.filter(
                    pricing_type='box',
                    is_active=True
                ).first()
            
            if box_pricing:
                box_price_per_unit = box_pricing.unit_price
                box_total = box_pricing.base_price + (box_pricing.unit_price * box_quantity)
            else:
                box_total = box_price_per_unit * box_quantity
            
            total_price += box_total
        
        # Расчет стоимости паллет
        if pallet_quantity > 0:
            # Ищем тариф для паллет
            pallet_pricing = None
            if container_type:
                pallet_pricing = Pricing.objects.filter(
                    pricing_type='pallet',
                    specification=container_type,
                    is_active=True
                ).first()
            
            if not pallet_pricing:
                # If no specific pricing found, get the first available pallet pricing
                pallet_pricing = Pricing.objects.filter(
                    pricing_type='pallet',
                    is_active=True
                ).first()
            
            if pallet_pricing:
                pallet_price_per_unit = pallet_pricing.unit_price
                pallet_total = pallet_pricing.base_price + (pallet_pricing.unit_price * pallet_quantity)
            else:
                pallet_total = pallet_price_per_unit * pallet_quantity
            
            total_price += pallet_total
        
        # Получаем текущие дату/время
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Сохраняем информацию о грузе и клиенте в JSON-поле
        additional_info = {
            'cargo_info': cargo_data,
            'client_info': client_data
        }
        
        # Это минимальный набор полей для создания заказа
        with connection.cursor() as cursor:
            # Форматируем строки для прямого вставления в SQL
            now_str = f"'{now}'"
            total_price_str = f"'{str(total_price)}'"
            status_str = "'new'"
            # Используем более простой подход к экранированию кавычек
            json_str = json.dumps(additional_info)
            json_str = json_str.replace("'", "''")
            additional_info_str = f"'{json_str}'"
            user_id_str = '1'
            warehouse_id_str = f"{warehouse_id if warehouse_id is not None else 'NULL'}"
            pickup_address_str = f"'{pickup_address}'" if pickup_address else "NULL"
            
            # Прямой SQL запрос без плейсхолдеров
            direct_sql = f"""
            INSERT INTO orders_order (
                created_at, cost, status, additional_info, status_updated_at, 
                user_id_id, warehouse_id_id, pickup_address
            ) VALUES (
                {now_str}, {total_price_str}, {status_str}, {additional_info_str}, {now_str}, 
                {user_id_str}, {warehouse_id_str}, {pickup_address_str}
            )
            """
            
            print(f"DEBUG: Direct SQL: {direct_sql}")
            cursor.execute(direct_sql)
            
            # Получаем ID созданного заказа
            cursor.execute("SELECT last_insert_rowid()")
            order_id = cursor.fetchone()[0]
        
        # Формируем ответ
        return JsonResponse({
            'success': True,
            'message': 'Order created successfully',
            'order': {
                'id': order_id,
                'status': 'new',
                'total_price': str(total_price),
                'created_at': now,
                'warehouse_id': warehouse_id,
                'pickup_address': pickup_address,
                'client': {
                    'name': client_data.get('clientName', ''),
                    'phone': client_data.get('phone', '')
                },
                'pricing': {
                    'base_price': str(base_price),
                    'box_price': {
                        'per_unit': str(box_price_per_unit),
                        'quantity': box_quantity,
                        'total': str(box_total)
                    },
                    'pallet_price': {
                        'per_unit': str(pallet_price_per_unit),
                        'quantity': pallet_quantity,
                        'total': str(pallet_total)
                    }
                }
            }
        }, status=201)
    
    except Exception as e:
        # Логируем ошибки для диагностики
        print(f"Error creating order: {e}")
        print(traceback.format_exc())
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
def test_pricing(request):
    """
    Тестовый эндпоинт для проверки расчета стоимости
    """
    try:
        # Получаем склад
        warehouse = Warehouse.objects.get(id=6)  # Используем склад с ID 6 (Яндекс.Маркет Томилино)
        
        # Получаем тариф доставки
        delivery_pricing = Pricing.objects.filter(
            pricing_type='delivery',
            warehouse=warehouse
        ).first()
        
        delivery_cost = delivery_pricing.base_price if delivery_pricing else 0
        
        # Получаем тариф для коробок
        box_pricing = Pricing.objects.filter(
            pricing_type='box'
        ).first()
        
        box_cost = 0
        if box_pricing:
            box_count = 5  # Фиксированное количество коробок для теста
            box_cost = box_pricing.base_price + (box_pricing.unit_price * box_count)
        
        # Получаем тариф для дополнительных услуг
        additional_services = []
        additional_services_cost = 0
        for service_id in [1, 5]:  # Фиксированные ID дополнительных услуг для теста
            service = Pricing.objects.filter(id=service_id).first()
            if service:
                price_str = str(service.base_price)
                additional_services.append({
                    'id': service_id,
                    'name': service.name,
                    'price': price_str
                })
                additional_services_cost += service.base_price
        
        # Рассчитываем общую стоимость (все значения должны быть Decimal)
        total_price = delivery_cost + box_cost + additional_services_cost
        
        return Response({
            'warehouse': {
                'id': warehouse.id,
                'name': warehouse.name
            },
            'delivery': {
                'found': delivery_pricing is not None,
                'name': delivery_pricing.name if delivery_pricing else None,
                'price': str(delivery_cost)
            },
            'box': {
                'found': box_pricing is not None,
                'name': box_pricing.name if box_pricing else None,
                'price': str(box_cost),
                'count': 5
            },
            'additional_services': additional_services,
            'additional_services_cost': str(additional_services_cost),
            'total_price': str(total_price)
        })
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)