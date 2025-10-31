export interface CustomizationOption {
    id: number;
    name: string;
    price: number;
}

export interface CustomizationGroup {
    id: string;
    name: string;
    min: number;
    max: number;
    options: CustomizationOption[];
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number; // Base price
    customizationGroups?: CustomizationGroup[];
}

export interface MenuCategory {
    id: string;
    name: string;
    coverImage?: string; // Optional cover image for the category
    items: MenuItem[];
}

// Represents an item once it's in the cart, with all customizations
export interface CartItem {
    cartItemId: string; // Unique ID for the item in the cart
    id: number; // Original MenuItem ID
    name: string;
    image: string;
    quantity: number;
    notes?: string;
    basePrice: number;
    totalPrice: number; // basePrice + price of all selected customizations
    customizations: {
        [groupName: string]: CustomizationOption[];
    };
}

export interface AiRecommendation {
    name: string;
    reason: string;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    streetAndNumber: string;
    neighborhood: string;
    apartmentDetails: string;
    landmark: string;
}

export type PaymentMethod = 'Cartão de Débito' | 'Cartão de Crédito' | 'Pix' | 'Dinheiro';

export type DeliveryType = 'Entrega' | 'Retirada';

export type OrderStatus = 'Pedido realizado' | 'Pedido aceito' | 'Saiu para entrega' | 'Pedido entregue';

export interface OrderStatusUpdate {
    status: OrderStatus;
    timestamp: number;
}

export interface Order {
    id: string; // internal unique ID
    displayId: string; // user-facing ID like #12345
    date: string;
    items: CartItem[];
    totalPrice: number; // subtotal + deliveryFee (if applicable)
    deliveryFee: number; // can be 0 for pickup
    deliveryType: DeliveryType;
    status: OrderStatus; // The current status
    statusHistory: OrderStatusUpdate[];
    payment: {
        method: PaymentMethod;
        cashForChange?: number;
    };
    customerInfo: CustomerInfo;
    rating?: number;
    review?: string;
    estimatedDeliveryTime?: number;
}