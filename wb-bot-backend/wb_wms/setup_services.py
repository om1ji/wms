import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wb_wms.settings')
django.setup()

# Импорт модели после настройки Django
from orders.models import Pricing

# Создание тестовых услуг
def create_test_services():
    # Удаляем существующие услуги (чтобы избежать дублирования)
    Pricing.objects.filter(pricing_type__in=['pickup', 'palletizing', 'loader']).delete()
    
    # Забор груза
    Pricing.objects.create(
        name='Забор груза (до 10 коробок)',
        pricing_type='pickup',
        specification='city_small',
        base_price=500
    )
    
    Pricing.objects.create(
        name='Забор груза (свыше 10 коробок)',
        pricing_type='pickup',
        specification='city_large',
        base_price=1000
    )
    
    Pricing.objects.create(
        name='Забор груза (1 паллет до 500кг)',
        pricing_type='pickup',
        specification='city_pallet_small',
        base_price=1000
    )
    
    Pricing.objects.create(
        name='Забор груза (1 паллет свыше 500кг)',
        pricing_type='pickup',
        specification='city_pallet_large',
        base_price=1500
    )
    
    # Паллетирование
    Pricing.objects.create(
        name='Паллетирование (до 1 куба)',
        pricing_type='palletizing',
        specification='small',
        base_price=400
    )
    
    Pricing.objects.create(
        name='Паллетирование (свыше 1 куба)',
        pricing_type='palletizing',
        specification='large',
        base_price=500
    )
    
    # Услуги грузчика
    Pricing.objects.create(
        name='Услуги грузчика (до 20 коробок)',
        pricing_type='loader',
        specification='20',
        base_price=500
    )
    
    Pricing.objects.create(
        name='Услуги грузчика (21-40 коробок)',
        pricing_type='loader',
        specification='40',
        base_price=1000
    )
    
    Pricing.objects.create(
        name='Услуги грузчика (41-60 коробок)',
        pricing_type='loader',
        specification='60',
        base_price=1500
    )
    
    Pricing.objects.create(
        name='Услуги грузчика (свыше 60 коробок)',
        pricing_type='loader',
        specification='61plus',
        base_price=2000
    )
    
    print("Тестовые услуги успешно созданы:")
    for service in Pricing.objects.filter(pricing_type__in=['pickup', 'palletizing', 'loader']):
        print(f"- {service.name}: {service.base_price} ₽")

if __name__ == "__main__":
    create_test_services() 