from rest_framework import serializers
from .models import Order, Warehouse, Container, Marketplace, City, User
from rest_framework.response import Response
from rest_framework import status

class MarketplaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marketplace
        fields = '__all__'

class WarehouseSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    marketplace_name = serializers.CharField(source='marketplace.name', read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'marketplace', 'marketplace_name', 'city', 'city_name']
        
    def list(self, request):
        warehouses = Warehouse.objects.all()
        serializer = self.serializer_class(warehouses, many=True)
        return Response(serializer.data)
    
    
class OrderSerializer(serializers.ModelSerializer):
    containers_info = serializers.SerializerMethodField()
    client_info = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('created_at', 'status_updated_at')

    def get_containers_info(self, obj):
        if isinstance(obj, Order):
            return [
                {
                    'type': container.container_type,
                    'size': container.box_size if container.container_type == "Коробка" else container.pallet_weight,
                    'quantity': container.quantity
                }
                for container in obj.containers.all()
            ]
        return []

    def get_client_info(self, obj):
        if isinstance(obj, Order):
            return {
                'company_name': obj.user_id.company_name,
                'client_name': obj.user_id.username,
                'email': obj.user_id.email,
                'phone': obj.user_id.phone
            }
        return {}

    def to_internal_value(self, data):
        return data

    def create(self, validated_data):
        try:
            # Извлекаем данные
            delivery_data = validated_data.get('delivery', {})
            cargo_type_data = validated_data.get('cargoType', {})
            client_data = validated_data.get('clientData', {})

            # Проверяем наличие необходимых данных
            if not delivery_data or not cargo_type_data or not client_data:
                raise serializers.ValidationError("Missing required data")

            # Создаем или получаем связанные объекты
            try:
                warehouse = Warehouse.objects.get(id=delivery_data['warehouse'])
            except Warehouse.DoesNotExist:
                raise serializers.ValidationError(f"Warehouse with id {delivery_data['warehouse']} not found")

            # Создаем или получаем пользователя
            user, _ = User.objects.get_or_create(
                email=client_data['email'],
                defaults={
                    'username': client_data['email'],
                    'phone': client_data['phone'],
                    'company_name': client_data['companyName'],
                    'telegram_id': ''  # Добавляем пустое значение для telegram_id
                }
            )

            # Создаем заказ
            order = Order.objects.create(
                user_id=user,
                warehouse_id=warehouse,
                cost=float(client_data['cargoValue']),
                status="Создан",
                additional_info=client_data.get('comments', '')
            )

            # Создаем контейнеры
            for container_type in cargo_type_data.get('selectedTypes', []):
                # Безопасно получаем размер коробки или вес паллеты
                box_size = None
                pallet_weight = None
                
                if container_type == "Коробка":
                    selected_box_sizes = cargo_type_data.get('selectedBoxSizes', [])
                    box_size = selected_box_sizes[0] if selected_box_sizes else None
                elif container_type == "Паллета":
                    selected_pallet_weights = cargo_type_data.get('selectedPalletWeights', [])
                    pallet_weight = selected_pallet_weights[0] if selected_pallet_weights else None
                
                quantity = cargo_type_data.get('quantities', {}).get(container_type, 1)

                container = Container.objects.create(
                    name=f"Container for {client_data['email']}",
                    container_type=container_type,
                    box_size=box_size,
                    pallet_weight=pallet_weight,
                    quantity=quantity
                )
                order.containers.add(container)

            return order

        except Exception as e:
            print(f"Error creating order: {str(e)}")
            raise serializers.ValidationError(f"Error creating order: {str(e)}")
    
    def update(self, instance, validated_data):
        # Обновляем только статус, если он передан
        if 'status' in validated_data:
            instance.status = validated_data['status']
            instance.save()
        return instance
    
    def delete(self, instance):
        instance.delete()
        return instance
    
    def list(self, request):
        orders = Order.objects.all()
        serializer = self.serializer_class(orders, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk):
        order = Order.objects.get(pk=pk)
        serializer = self.serializer_class(order)
        return Response(serializer.data)
    
    def destroy(self, request, pk):
        order = Order.objects.get(pk=pk)
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ContainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Container
        fields = '__all__'
        
    def list(self, request):
        containers = Container.objects.all()
        serializer = self.serializer_class(containers, many=True)
        return Response(serializer.data)
    
    
