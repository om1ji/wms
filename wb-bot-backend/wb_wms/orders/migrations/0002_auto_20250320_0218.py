# Generated by Django 4.2 on 2025-03-19 23:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Pricing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255, verbose_name="Название")),
                (
                    "pricing_type",
                    models.CharField(
                        choices=[
                            ("box", "Коробка"),
                            ("pallet", "Паллета"),
                            ("delivery", "Доставка"),
                            ("pickup", "Забор груза"),
                            ("palletizing", "Паллетирование"),
                            ("loader", "Услуги грузчика"),
                            ("other", "Другое"),
                        ],
                        max_length=50,
                        verbose_name="Тип тарифа",
                    ),
                ),
                ("specification", models.CharField(blank=True, max_length=100, null=True, verbose_name="Спецификация")),
                ("base_price", models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name="Базовая цена")),
                ("unit_price", models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name="Цена за единицу")),
                ("description", models.TextField(blank=True, null=True, verbose_name="Описание")),
                (
                    "warehouse",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="orders.warehouse",
                        verbose_name="Склад",
                    ),
                ),
            ],
            options={
                "verbose_name": "Тариф",
                "verbose_name_plural": "Тарифы",
            },
        ),
    ]
