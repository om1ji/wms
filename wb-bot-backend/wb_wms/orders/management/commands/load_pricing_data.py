from django.core.management.base import BaseCommand
from orders.models import Pricing, Warehouse
from decimal import Decimal

class Command(BaseCommand):
    help = 'Загружает начальные данные о ценах'

    def handle(self, *args, **options):
        # Очищаем существующие данные
        Pricing.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Удалены существующие данные о ценах'))

        # Цены на коробки
        box_prices = [
            {
                'name': 'Коробка стандарт 60x40x40',
                'pricing_type': 'box',
                'specification': '60x40x40 см',
                'base_price': Decimal('450'),
                'unit_price': Decimal('0'),
                'description': 'Стандартная коробка'
            },
            {
                'name': 'Коробка стандарт 45x45x45',
                'pricing_type': 'box',
                'specification': '45x45x45 см',
                'base_price': Decimal('450'),
                'unit_price': Decimal('0'),
                'description': 'Стандартная коробка'
            },
            {
                'name': 'Коробка до 0.1 куба',
                'pricing_type': 'box',
                'specification': 'Другой размер',
                'base_price': Decimal('450'),
                'unit_price': Decimal('0'),
                'description': 'Коробка нестандартного размера до 0.1 куб. м.'
            },
            {
                'name': 'Коробка 0.1-0.2 куба',
                'pricing_type': 'box',
                'specification': 'Другой размер',
                'base_price': Decimal('600'),
                'unit_price': Decimal('0'),
                'description': 'Коробка нестандартного размера 0.1-0.2 куб. м.'
            },
            {
                'name': 'Коробка более 0.2 куба',
                'pricing_type': 'box',
                'specification': 'Другой размер',
                'base_price': Decimal('700'),
                'unit_price': Decimal('0'),
                'description': 'Коробка нестандартного размера более 0.2 куб. м.'
            },
        ]

        # Цены на монопаллеты
        pallet_prices = [
            {
                'name': 'Монопаллета 1/2/3 арт. 0-200кг',
                'pricing_type': 'pallet',
                'specification': '0-200 кг',
                'base_price': Decimal('3500'),
                'unit_price': Decimal('0'),
                'description': 'Монопаллета 1/2/3 артикула до 200 кг'
            },
            {
                'name': 'Монопаллета 1/2/3 арт. 200-300кг',
                'pricing_type': 'pallet',
                'specification': '200-300 кг',
                'base_price': Decimal('4000'),
                'unit_price': Decimal('0'),
                'description': 'Монопаллета 1/2/3 артикула 200-300 кг'
            },
            {
                'name': 'Монопаллета 1/2/3 арт. 300-400кг',
                'pricing_type': 'pallet',
                'specification': '300-400 кг',
                'base_price': Decimal('4500'),
                'unit_price': Decimal('0'),
                'description': 'Монопаллета 1/2/3 артикула 300-400 кг'
            },
            {
                'name': 'Монопаллета 1/2/3 арт. 400-500кг',
                'pricing_type': 'pallet',
                'specification': '400-500 кг',
                'base_price': Decimal('5000'),
                'unit_price': Decimal('0'),
                'description': 'Монопаллета 1/2/3 артикула 400-500 кг'
            },
            {
                'name': 'Монопаллета 1/2/3 арт. более 500кг',
                'pricing_type': 'pallet',
                'specification': 'Другой вес',
                'base_price': Decimal('5000'),
                'unit_price': Decimal('1000'),  # За каждые дополнительные 100кг
                'description': 'Монопаллета 1/2/3 артикула более 500 кг, +1000 руб. за каждые 100 кг'
            },
        ]

        # Доп. услуги - Забор груза
        pickup_services = [
            {
                'name': 'Забор груза по городу (1-10 коробок)',
                'pricing_type': 'additional',
                'specification': 'pickup_city_small',
                'base_price': Decimal('500'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза по городу от 1 до 10 коробок'
            },
            {
                'name': 'Забор груза по городу (11+ коробок)',
                'pricing_type': 'additional',
                'specification': 'pickup_city_large',
                'base_price': Decimal('1000'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза по городу 11 и более коробок'
            },
            {
                'name': 'Забор груза по городу (1 паллет до 500кг)',
                'pricing_type': 'additional',
                'specification': 'pickup_city_pallet_small',
                'base_price': Decimal('1000'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза по городу 1 паллет до 500кг'
            },
            {
                'name': 'Забор груза по городу (1 паллет 500+ кг)',
                'pricing_type': 'additional',
                'specification': 'pickup_city_pallet_large',
                'base_price': Decimal('1500'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза по городу 1 паллет более 500кг'
            },
            {
                'name': 'Забор груза за городом до 20км',
                'pricing_type': 'additional',
                'specification': 'pickup_suburban_20km',
                'base_price': Decimal('2500'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза за городом на расстоянии до 20км'
            },
            {
                'name': 'Забор груза за городом 20-50км',
                'pricing_type': 'additional',
                'specification': 'pickup_suburban_50km',
                'base_price': Decimal('4000'),
                'unit_price': Decimal('0'),
                'description': 'Забор груза за городом на расстоянии 20-50км'
            },
        ]

        # Дополнительные услуги - Паллетирование и грузчики
        additional_services = [
            {
                'name': 'Паллетирование (1 паллет до 1 куба)',
                'pricing_type': 'additional',
                'specification': 'palletizing_small',
                'base_price': Decimal('400'),
                'unit_price': Decimal('0'),
                'description': 'Паллетирование груза для 1 паллеты объемом до 1 куб. м.'
            },
            {
                'name': 'Паллетирование (1 паллет более 1 куба)',
                'pricing_type': 'additional',
                'specification': 'palletizing_large',
                'base_price': Decimal('500'),
                'unit_price': Decimal('0'),
                'description': 'Паллетирование груза для 1 паллеты объемом более 1 куб. м.'
            },
            {
                'name': 'Услуги грузчика (до 20 коробок)',
                'pricing_type': 'additional',
                'specification': 'loader_20',
                'base_price': Decimal('500'),
                'unit_price': Decimal('0'),
                'description': 'Услуги грузчика для перемещения до 20 коробок'
            },
            {
                'name': 'Услуги грузчика (21-40 коробок)',
                'pricing_type': 'additional',
                'specification': 'loader_40',
                'base_price': Decimal('1000'),
                'unit_price': Decimal('0'),
                'description': 'Услуги грузчика для перемещения от 21 до 40 коробок'
            },
            {
                'name': 'Услуги грузчика (41-60 коробок)',
                'pricing_type': 'additional',
                'specification': 'loader_60',
                'base_price': Decimal('1500'),
                'unit_price': Decimal('0'),
                'description': 'Услуги грузчика для перемещения от 41 до 60 коробок'
            },
            {
                'name': 'Услуги грузчика (61+ коробок)',
                'pricing_type': 'additional',
                'specification': 'loader_61plus',
                'base_price': Decimal('2000'),
                'unit_price': Decimal('0'),
                'description': 'Услуги грузчика для перемещения от 61 и более коробок'
            },
        ]

        # Объединяем все цены
        all_pricing_data = box_prices + pallet_prices + pickup_services + additional_services

        # Создаем объекты в базе данных
        for price_data in all_pricing_data:
            Pricing.objects.create(**price_data)
            self.stdout.write(f"Добавлен тариф: {price_data['name']}")

        # Добавляем цены доставки для каждого склада
        # Предполагаем, что базовая цена доставки 2000 руб для любого склада
        warehouses = Warehouse.objects.all()
        for warehouse in warehouses:
            Pricing.objects.create(
                name=f'Доставка на склад {warehouse.name}',
                pricing_type='delivery',
                warehouse=warehouse,
                base_price=Decimal('2000'),
                unit_price=Decimal('0'),
                description=f'Базовая стоимость доставки на склад {warehouse.name}'
            )
            self.stdout.write(f"Добавлен тариф доставки для склада: {warehouse.name}")

        self.stdout.write(self.style.SUCCESS('Успешно загружены все тарифы')) 