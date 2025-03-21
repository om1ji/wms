const API_BASE_URL = 'http://localhost:8000';

interface Warehouse {
    id: number;
    city: string;
    city_name: string;
    marketplace: string;    
    marketplace_name: string;
    name: string;
}

interface ContainerType {
    id: number;
    name: string;
    description: string;
    container_type: string;
    box_size: string;
    pallet_weight: string;
}

interface PriceResponse {
    total_price: string;
    currency: string;
    details: {
        delivery: string;
        cargo: string;
        additional_services: string;
    };
}

export const api = {
    // Получение списка маркетплейсов со складами
    async getWarehouses() : Promise<Warehouse[]> {
        const response = await fetch(`${API_BASE_URL}/orders/warehouses/`);
        if (!response.ok) {
            throw new Error('Failed to fetch marketplaces');
        }
        return response.json();
    },

    // Получение списка типов контейнеров
    async getContainerTypes() : Promise<ContainerType[]> {
        const response = await fetch(`${API_BASE_URL}/orders/containers/`);
        if (!response.ok) {
            throw new Error('Failed to fetch container types');
        }
        return response.json();
    },

    // Получение списка дополнительных услуг
    async getAdditionalServices() {
        const response = await fetch(`${API_BASE_URL}/orders/additional-services/`);
        if (!response.ok) {
            throw new Error('Failed to fetch additional services');
        }
        return response.json();
    },

    // Создание нового заказа
    async createOrder(orderData) {
        // Подготовим данные для отправки на сервер
        const apiOrderData = {
            delivery: {
                warehouse: orderData.warehouse
            },
            cargoType: {
                selectedTypes: orderData.selectedTypes || [orderData.cargoType === 'box' ? 'Коробка' : 'Паллета'],
                selectedBoxSizes: orderData.selectedBoxSizes || [],
                selectedPalletWeights: orderData.selectedPalletWeights || [],
                quantities: {
                    'Коробка': parseInt(orderData.quantities?.['Коробка'] || orderData.boxCount || 0),
                    'Паллета': parseInt(orderData.quantities?.['Паллета'] || orderData.palletCount || 0)
                }
            },
            clientData: {
                clientName: orderData.clientName,
                phone: orderData.phoneNumber,
                companyName: orderData.company || "",
                email: orderData.email || ""
            },
            additionalServices: orderData.additionalServices || [],
            pickupAddress: orderData.pickupAddress || ''
        };

        // Если у нас нет selectedBoxSizes, но есть containerType, добавляем его
        if (apiOrderData.cargoType.selectedBoxSizes.length === 0 && orderData.containerType) {
            apiOrderData.cargoType.selectedBoxSizes = [orderData.containerType];
        }

        console.log("Creating order with data:", apiOrderData);

        const response = await fetch(`${API_BASE_URL}/api/order/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiOrderData),
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Server error response:', error);
            throw new Error(error.message || error.error || 'Failed to create order');
        }
        
        return response.json();
    },
    
    // Расчет стоимости заказа
    async calculatePrice(formData): Promise<PriceResponse> {
        // Подготовим данные для отправки на сервер
        const apiPriceData = {
            delivery: {
                warehouse_id: formData.warehouse,
                marketplace: formData.marketplace
            },
            cargo: {
                cargo_type: formData.selectedTypes?.includes('Паллета') ? 'pallet' : 'box',
                container_type: formData.selectedTypes?.includes('Паллета') 
                    ? (formData.selectedPalletWeights?.[0] || '') 
                    : (formData.selectedBoxSizes?.[0] || formData.containerType || ''),
                box_count: formData.selectedTypes?.includes('Коробка') 
                    ? parseInt(formData.quantities?.['Коробка'] || formData.boxCount || 0) 
                    : 0,
                pallet_count: formData.selectedTypes?.includes('Паллета') 
                    ? parseInt(formData.quantities?.['Паллета'] || formData.palletCount || 0) 
                    : 0,
                dimensions: {
                    length: formData.length,
                    width: formData.width,
                    height: formData.height,
                    weight: formData.weight
                }
            },
            additional_services: formData.additionalServices || [],
            pickup_address: formData.pickupAddress || ''
        };

        console.log("Sending price calculation request:", apiPriceData);

        const response = await fetch(`${API_BASE_URL}/orders/calculate-price/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPriceData),
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error("Price calculation error:", error);
            throw new Error(error.error || 'Failed to calculate price');
        }
        
        const result = await response.json();
        console.log("Price calculation result:", result);
        return result;
    },
}; 