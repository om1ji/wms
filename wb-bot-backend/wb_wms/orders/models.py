from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

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
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    containers = models.ManyToManyField(Container)
    warehouse_id = models.ForeignKey(Warehouse, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=255, choices=STATUS)
    additional_info = models.TextField(blank=True)
    status_updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id}"

    def save(self, *args, **kwargs):
        # Обновляем статус_updated_at при изменении статуса
        if self.pk:
            original = Order.objects.get(pk=self.pk)
            if original.status != self.status:
                self.status_updated_at = timezone.now()
        super().save(*args, **kwargs)


