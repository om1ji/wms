from django.contrib import admin
from .models import Warehouse, Order, Pricing, Container, Marketplace, City, User, AdditionalService

# Register your models here.
admin.site.register(Marketplace)
admin.site.register(City)
admin.site.register(User)

class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'marketplace', 'city', 'marketplace_name', 'city_name')
    search_fields = ('name', 'marketplace__name', 'city__name')
    list_filter = ('marketplace', 'city')
    
    def marketplace_name(self, obj):
        return obj.marketplace.name
    
    def city_name(self, obj):
        return obj.city.name
    
    marketplace_name.short_description = "Маркетплейс"
    city_name.short_description = "Город"

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'phone_number', 'warehouse', 'status', 'total_price', 'created_at')
    search_fields = ('id', 'client_name', 'phone_number')
    list_filter = ('status', 'warehouse')
    readonly_fields = ('total_price',)
    filter_horizontal = ('services',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('status', 'warehouse', 'total_price')
        }),
        ('Информация о клиенте', {
            'fields': ('client_name', 'phone_number', 'company', 'email', 'telegram_user_id')
        }),
        ('Информация о грузе', {
            'fields': ('cargo_type', 'container_type', 'box_count', 'pallet_count', 
                       'length', 'width', 'height', 'weight')
        }),
        ('Дополнительные услуги', {
            'fields': ('services', 'pickup_address', 'additional_services')
        }),
    )

class PricingAdmin(admin.ModelAdmin):
    list_display = ('name', 'pricing_type', 'specification', 'base_price', 'unit_price', 'warehouse', 'is_active')
    list_filter = ('pricing_type', 'warehouse', 'is_active')
    search_fields = ('name', 'specification')

class AdditionalServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'price', 'requires_location', 'is_active')
    list_filter = ('service_type', 'requires_location', 'is_active')
    search_fields = ('name', 'description')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'service_type', 'price', 'is_active')
        }),
        ('Дополнительные настройки', {
            'fields': ('requires_location', 'description')
        }),
    )

# Регистрация моделей
admin.site.register(Warehouse, WarehouseAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Pricing, PricingAdmin)
admin.site.register(Container)
admin.site.register(AdditionalService, AdditionalServiceAdmin)