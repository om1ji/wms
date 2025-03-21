import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wb_wms.settings')
django.setup()

# Импорт моделей после настройки Django
from orders.models import Marketplace, City, Warehouse, Pricing

def create_test_warehouses():
    # Очистка данных (осторожно, удаляются все данные)
    # Pricing.objects.filter(pricing_type='delivery').delete()
    # Warehouse.objects.all().delete()
    # City.objects.all().delete()
    # Marketplace.objects.all().delete()
    
    # Создание маркетплейсов
    ozon, _ = Marketplace.objects.get_or_create(name='OZON')
    wildberries, _ = Marketplace.objects.get_or_create(name='Wildberries')
    yandex, _ = Marketplace.objects.get_or_create(name='Яндекс.Маркет')
    
    # Создание городов
    moscow, _ = City.objects.get_or_create(name='Москва')
    spb, _ = City.objects.get_or_create(name='Санкт-Петербург')
    
    # Создание складов
    warehouse1, created1 = Warehouse.objects.get_or_create(
        name='Хоругвино',
        marketplace=ozon,
        city=moscow
    )
    
    warehouse2, created2 = Warehouse.objects.get_or_create(
        name='Невский',
        marketplace=wildberries,
        city=spb
    )
    
    warehouse3, created3 = Warehouse.objects.get_or_create(
        name='Томилино',
        marketplace=yandex,
        city=moscow
    )
    
    # Создание тарифов доставки
    if created1:
        Pricing.objects.create(
            name='Доставка OZON Хоругвино',
            pricing_type='delivery',
            base_price=2500,
            warehouse=warehouse1
        )
    
    if created2:
        Pricing.objects.create(
            name='Доставка Wildberries Невский',
            pricing_type='delivery',
            base_price=3000,
            warehouse=warehouse2
        )
    
    if created3:
        Pricing.objects.create(
            name='Доставка Яндекс.Маркет Томилино',
            pricing_type='delivery',
            base_price=2800,
            warehouse=warehouse3
        )
    
    # Создание тарифов для коробок
    if not Pricing.objects.filter(pricing_type='box', specification='60x40x40 см').exists():
        Pricing.objects.create(
            name='Коробка 60x40x40 см',
            pricing_type='box',
            specification='60x40x40 см',
            base_price=100,
            unit_price=50
        )
    
    if not Pricing.objects.filter(pricing_type='box', specification='50x40x40 см').exists():
        Pricing.objects.create(
            name='Коробка 50x40x40 см',
            pricing_type='box',
            specification='50x40x40 см',
            base_price=80,
            unit_price=40
        )
    
    # Создание тарифов для паллет
    if not Pricing.objects.filter(pricing_type='pallet', specification='0-200 кг').exists():
        Pricing.objects.create(
            name='Паллета 0-200 кг',
            pricing_type='pallet',
            specification='0-200 кг',
            base_price=800,
            unit_price=400
        )
    
    if not Pricing.objects.filter(pricing_type='pallet', specification='200-300 кг').exists():
        Pricing.objects.create(
            name='Паллета 200-300 кг',
            pricing_type='pallet',
            specification='200-300 кг',
            base_price=1000,
            unit_price=500
        )
    
    # Вывод информации о созданных данных
    print('Созданы маркетплейсы:')
    for mp in Marketplace.objects.all():
        print(f'- {mp.name}')
    
    print('\nСозданы города:')
    for city in City.objects.all():
        print(f'- {city.name}')
    
    print('\nСозданы склады:')
    for wh in Warehouse.objects.all():
        print(f'- {wh.name} ({wh.marketplace.name}, {wh.city.name})')
    
    print('\nСозданы тарифы:')
    for pricing in Pricing.objects.filter(pricing_type__in=['delivery', 'box', 'pallet']):
        if pricing.warehouse:
            print(f'- {pricing.name}: {pricing.base_price} ₽ (склад: {pricing.warehouse.name})')
        else:
            print(f'- {pricing.name}: базовая {pricing.base_price} ₽, за единицу {pricing.unit_price} ₽')

if __name__ == "__main__":
    create_test_warehouses() 