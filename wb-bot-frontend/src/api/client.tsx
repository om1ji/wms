const API_BASE_URL = process.env.BACKEND_API_URL;

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

    // Создание нового заказа
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
        
        return response.json();
    },
}; 