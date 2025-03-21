# Generated by Django 4.2 on 2025-03-19 23:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0003_pricing_is_active"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdditionalService",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(max_length=255, verbose_name="Название услуги"),
                ),
                (
                    "price",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=10,
                        verbose_name="Стоимость",
                    ),
                ),
                (
                    "service_type",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("pickup", "Забор груза"),
                            ("palletizing", "Паллетирование"),
                            ("loader", "Услуги грузчика"),
                            ("other", "Другое"),
                        ],
                        max_length=50,
                        null=True,
                        verbose_name="Тип услуги",
                    ),
                ),
                (
                    "requires_location",
                    models.BooleanField(default=False, verbose_name="Требует адрес"),
                ),
                (
                    "description",
                    models.TextField(blank=True, null=True, verbose_name="Описание"),
                ),
                (
                    "is_active",
                    models.BooleanField(default=True, verbose_name="Активна"),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Дата создания"
                    ),
                ),
            ],
            options={
                "verbose_name": "Дополнительная услуга",
                "verbose_name_plural": "Дополнительные услуги",
                "ordering": ["service_type", "name"],
            },
        ),
        migrations.AddField(
            model_name="order",
            name="pickup_address",
            field=models.TextField(
                blank=True, null=True, verbose_name="Адрес забора груза"
            ),
        ),
        migrations.AlterField(
            model_name="order",
            name="additional_services",
            field=models.JSONField(
                blank=True,
                default=list,
                verbose_name="Дополнительные услуги (устаревшее)",
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="services",
            field=models.ManyToManyField(
                blank=True,
                to="orders.additionalservice",
                verbose_name="Дополнительные услуги",
            ),
        ),
    ]
