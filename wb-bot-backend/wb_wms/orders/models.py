from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

STATUS = [
    ("Создан", "Создан"),
    ("Ожидает оплаты", "Ожидает оплаты"),
    ("Принят", "Принят"),
    ("На складе", "На складе"),
    ("В пути", "В пути"),
    ("Доставлен", "Доставлен"),
    ("Отменен", "Отменен"),
]


class Marketplace(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
class Warehouse(models.Model):
    name = models.CharField(max_length=255)
    marketplace = models.ForeignKey(Marketplace, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.marketplace.name} - {self.name}"

class Container(models.Model):
    CONTAINER_TYPES = [
        ("Коробка", "Коробка"),
        ("Паллета", "Паллета"),
    ]

    BOX_SIZES = [
        ("60x40x40 см", "60x40x40 см"),
        ("50x40x40 см", "50x40x40 см"),
        ("45x45x45 см", "45x45x45 см"),
        ("Другой размер", "Другой размер"),
    ]

    PALLET_WEIGHT = [
        ("0-200 кг", "0-200 кг"),
        ("200-300 кг", "200-300 кг"),
        ("300-400 кг", "300-400 кг"),
        ("400-500 кг", "400-500 кг"),
        ("Другой вес", "Другой вес"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    container_type = models.CharField(max_length=255, choices=CONTAINER_TYPES)
    box_size = models.CharField(max_length=255, choices=BOX_SIZES, null=True, blank=True)
    pallet_weight = models.CharField(max_length=255, choices=PALLET_WEIGHT, null=True, blank=True)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.container_type} - {self.box_size if self.container_type == 'Box' else self.pallet_weight}"

class User(AbstractUser):
    phone = models.CharField(max_length=255)
    telegram_id = models.CharField(max_length=255)
    company_name = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Order(models.Model):
    STATUS_CHOICES = (
        ('new', 'Новый'),
        ('processing', 'В обработке'),
        ('completed', 'Выполнен'),
        ('canceled', 'Отменен'),
    )
    
    # Информация о заказе
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус заказа')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    # Временно убрано, чтобы можно было создавать заказы без миграции
    # updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    # В нашей базе данных поля имеют другие имена
    # Эти свойства предоставляют доступ к реальным полям в БД
    # Стоимость заказа в БД хранится в поле cost
    @property
    def cost(self):
        return self.total_price
    
    @cost.setter
    def cost(self, value):
        self.total_price = value
    
    # Информация о заказе хранится в поле additional_info
    additional_info = ""
    
    # Поле status_updated_at используется вместо updated_at
    status_updated_at = None
    
    # Информация о доставке
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, verbose_name='Склад доставки')
    
    # Информация о грузе
    cargo_type = models.CharField(max_length=50, verbose_name='Тип груза')
    container_type = models.CharField(max_length=50, blank=True, null=True, verbose_name='Тип контейнера')
    box_count = models.PositiveIntegerField(blank=True, null=True, verbose_name='Количество коробок')
    pallet_count = models.PositiveIntegerField(blank=True, null=True, verbose_name='Количество паллет')
    length = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Длина, см')
    width = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Ширина, см')
    height = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Высота, см')
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Вес, кг')
    
    # Контактная информация
    client_name = models.CharField(max_length=255, verbose_name='Имя клиента')
    phone_number = models.CharField(max_length=20, verbose_name='Телефон')
    company = models.CharField(max_length=255, blank=True, null=True, verbose_name='Компания')
    email = models.EmailField(blank=True, null=True, verbose_name='Email')
    
    # Ценовая информация
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Общая стоимость')
    
    # Дополнительные услуги
    additional_services = models.JSONField(default=list, blank=True, verbose_name='Дополнительные услуги (устаревшее)')
    services = models.ManyToManyField('AdditionalService', blank=True, verbose_name='Дополнительные услуги')
    pickup_address = models.TextField(blank=True, null=True, verbose_name='Адрес забора груза')
    
    # Ссылка на пользователя Telegram (если заказ создан через бота)
    telegram_user_id = models.BigIntegerField(blank=True, null=True, verbose_name='ID пользователя Telegram')
    
    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Заказ №{self.id} - {self.client_name}'

    def calculate_price(self):
        """
        Рассчитывает стоимость заказа на основе тарифов
        """
        total_price = 0
        
        # Расчет стоимости доставки
        if hasattr(self, 'warehouse') and self.warehouse:
            delivery_pricing = Pricing.objects.filter(
                pricing_type='delivery',
                warehouse=self.warehouse
            ).first()
            
            if delivery_pricing:
                total_price += delivery_pricing.base_price
        
        # Расчет стоимости груза в зависимости от типа (коробки или паллеты)
        if self.cargo_type == 'box' and self.box_count:
            box_pricing = Pricing.objects.filter(
                pricing_type='box',
                specification=self.container_type
            ).first()
            
            if box_pricing:
                total_price += (box_pricing.base_price + (box_pricing.unit_price * self.box_count))
                
        elif self.cargo_type == 'pallet' and self.pallet_count:
            pallet_pricing = Pricing.objects.filter(
                pricing_type='pallet',
                specification=self.container_type
            ).first()
            
            if pallet_pricing:
                total_price += (pallet_pricing.base_price + (pallet_pricing.unit_price * self.pallet_count))
        
        # Расчет стоимости дополнительных услуг (из старого поля additional_services)
        if self.additional_services:
            for service_id in self.additional_services:
                pricing_type = service_id.split('_')[0] if isinstance(service_id, str) and '_' in service_id else None
                
                if isinstance(service_id, int) or (isinstance(service_id, str) and service_id.isdigit()):
                    # Если ID числовой, ищем по ID
                    service_id = int(service_id)
                    service_pricing = Pricing.objects.filter(id=service_id).first()
                    if service_pricing:
                        total_price += service_pricing.base_price
                elif pricing_type:
                    # Если ID в формате "тип_спецификация", ищем по этим полям
                    service_pricing = Pricing.objects.filter(
                        pricing_type=pricing_type,
                        specification=service_id.split('_', 1)[1]
                    ).first()
                    
                    if service_pricing:
                        total_price += service_pricing.base_price
        
        # Расчет стоимости по новой связи ManyToMany с AdditionalService
        if hasattr(self, 'services'):
            for service in self.services.filter(is_active=True):
                total_price += service.price
        
        return total_price

    def save(self, *args, **kwargs):
        # При сохранении заказа автоматически рассчитываем стоимость
        # При создании может возникнуть ошибка, если еще нет ID
        try:
            self.total_price = self.calculate_price()
        except Exception as e:
            import traceback
            print(f"Error calculating price: {e}")
            print(traceback.format_exc())
            # Если не удалось рассчитать стоимость, используем 0
            self.total_price = 0
            
        try:
            super().save(*args, **kwargs)
        except Exception as e:
            import traceback
            print(f"Error saving order: {e}")
            print(traceback.format_exc())
            raise

class Pricing(models.Model):
    PRICING_TYPES = (
        ('box', 'Коробка'),
        ('pallet', 'Паллета'),
        ('delivery', 'Доставка'),
        ('pickup', 'Забор груза'),
        ('palletizing', 'Паллетирование'),
        ('loader', 'Услуги грузчика'),
        ('other', 'Другое'),
    )
    
    name = models.CharField(max_length=255, verbose_name='Название')
    pricing_type = models.CharField(max_length=50, choices=PRICING_TYPES, verbose_name='Тип тарифа')
    specification = models.CharField(max_length=100, blank=True, null=True, verbose_name='Спецификация')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Базовая цена')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Цена за единицу')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Склад')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    
    class Meta:
        verbose_name = 'Тариф'
        verbose_name_plural = 'Тарифы'
        
    def __str__(self):
        if self.warehouse:
            return f'{self.name} ({self.get_pricing_type_display()}) - {self.warehouse.name}'
        return f'{self.name} ({self.get_pricing_type_display()})'

class AdditionalService(models.Model):
    """
    Модель для хранения дополнительных услуг
    """
    SERVICE_TYPES = (
        ('pickup', 'Забор груза'),
        ('palletizing', 'Паллетирование'),
        ('loader', 'Услуги грузчика'),
        ('other', 'Другое'),
    )
    
    name = models.CharField(max_length=255, verbose_name='Название услуги')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Стоимость')
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES, blank=True, null=True, 
                                  verbose_name='Тип услуги')
    requires_location = models.BooleanField(default=False, verbose_name='Требует адрес')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    
    class Meta:
        verbose_name = 'Дополнительная услуга'
        verbose_name_plural = 'Дополнительные услуги'
        ordering = ['service_type', 'name']
    
    def __str__(self):
        return f'{self.name} ({self.get_service_type_display() if self.service_type else "Без типа"})'


