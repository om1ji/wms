from django.contrib import admin
from .models import Order, Container, Warehouse, Marketplace, City

# Register your models here.
admin.site.register(Warehouse)
admin.site.register(Marketplace)
admin.site.register(City)

class ContainerInline(admin.TabularInline):
    model = Order.containers.through  # Используем through-модель для ManyToManyField
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'warehouse_id', 'cost', 'status')
    inlines = [ContainerInline]