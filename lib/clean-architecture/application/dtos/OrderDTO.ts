import { PaymentType } from '../../domain/value-objects/PaymentMethod';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  customizations?: string;
}

export interface CreateOrderInputDTO {
  studentName: string;
  studentId: string;
  items: CreateOrderItemInput[];
  pickupStationId: string;
  paymentType: PaymentType;
  instructions?: string;
  pickupTimeMode?: 'NOW' | 'SCHEDULED';
  scheduledTime?: string;
}

export interface OrderItemOutputDTO {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  customizations?: string;
  unitPrice: number;
  subtotal: number;
  formattedSubtotal: string;
}

export interface OrderOutputDTO {
  id: string;
  ticketNumber: string;
  status: string;
  statusLabel: string;
  stepNumber: number;
  studentName: string;
  studentId: string;
  pickupStation: {
    id: string;
    name: string;
    building: string;
    floor: string;
  };
  paymentMethod: {
    type: PaymentType;
    label: string;
    discountPercentage: number;
  };
  items: OrderItemOutputDTO[];
  subtotal: number;
  discount: number;
  total: number;
  loyaltyPoints: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
  instructions?: string;
  pickupTimeMode: 'NOW' | 'SCHEDULED';
  scheduledTime?: string;
  createdAt: string;
  estimatedReadyAt: string;
  canBeCancelled: boolean;
}

export interface ProductOutputDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  category: string;
  imageUrl: string;
  preparationTimeMinutes: number;
  calories: number;
  dietaryBadge?: string;
  isAvailable: boolean;
  isPopular: boolean;
  stockQuantity: number;
  tags: string[];
}
