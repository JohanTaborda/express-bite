import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { CAMPUS_STATIONS } from '../../domain/value-objects/PickupStation';
import { PAYMENT_METHODS } from '../../domain/value-objects/PaymentMethod';
import { Product } from '../../domain/entities/Product';

/**
 * Creates seed active and past orders for simulation and testing.
 */
export function createMockOrders(products: Product[]): Order[] {
  const pLatte = products.find((p) => p.id === 'prod-latte-caramelo') || products[1];
  const pCroissant = products.find((p) => p.id === 'prod-croissant') || products[3];
  const pSandwich = products.find((p) => p.id === 'prod-sandwich-pavo') || products[5];

  // 1. Live Active Order in Kitchen (#QB-2084 - Turno B-42)
  const item1 = new OrderItem({
    id: 'item-2084-1',
    product: pLatte,
    quantity: 1,
    customizations: 'Leche deslactosada • Mediano 12oz',
  });
  const item2 = new OrderItem({
    id: 'item-2084-2',
    product: pCroissant,
    quantity: 1,
    customizations: 'Mantequilla artesanal • Calentar',
  });
  const item3 = new OrderItem({
    id: 'item-2084-3',
    product: pSandwich,
    quantity: 1,
    customizations: 'Pan rústico de masa madre',
  });

  const now = new Date();
  const createdTenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const readyInSixMins = new Date(now.getTime() + 6 * 60 * 1000);

  const activeOrder = new Order({
    id: 'QB-2084',
    ticketNumber: 'B-42',
    items: [item1, item2, item3],
    status: 'PREPARING', // In Process
    pickupStation: CAMPUS_STATIONS[0],
    paymentDetails: {
      type: 'CARNE_ESTUDIANTIL',
      label: PAYMENT_METHODS.CARNE_ESTUDIANTIL.label,
      discountPercentage: 10,
      studentId: '2021-4892',
    },
    studentName: 'Sofía Mendoza',
    studentId: '2021-4892',
    instructions: 'Café con leche deslactosada bien caliente; sándwich prensado por favor.',
    createdAt: createdTenMinsAgo,
    estimatedReadyAt: readyInSixMins,
  });

  // 2. Historical completed order #QB-1972
  const itemHist1 = new OrderItem({
    id: 'item-1972-1',
    product: pSandwich,
    quantity: 1,
  });
  const itemHist2 = new OrderItem({
    id: 'item-1972-2',
    product: pCroissant,
    quantity: 1,
  });
  const pastOrder1 = new Order({
    id: 'QB-1972',
    ticketNumber: 'A-19',
    items: [itemHist1, itemHist2],
    status: 'DELIVERED',
    pickupStation: CAMPUS_STATIONS[0],
    paymentDetails: {
      type: 'CARNE_ESTUDIANTIL',
      label: PAYMENT_METHODS.CARNE_ESTUDIANTIL.label,
      discountPercentage: 10,
      studentId: '2021-4892',
    },
    studentName: 'Sofía Mendoza',
    studentId: '2021-4892',
    createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000), // yesterday
  });

  // 3. Historical completed order #QB-1890
  const itemHist3 = new OrderItem({
    id: 'item-1890-1',
    product: pLatte,
    quantity: 1,
  });
  const pastOrder2 = new Order({
    id: 'QB-1890',
    ticketNumber: 'C-08',
    items: [itemHist3],
    status: 'DELIVERED',
    pickupStation: CAMPUS_STATIONS[1],
    paymentDetails: {
      type: 'CREDIT_CARD',
      label: PAYMENT_METHODS.CREDIT_CARD.label,
      discountPercentage: 0,
      studentId: '2021-4892',
    },
    studentName: 'Sofía Mendoza',
    studentId: '2021-4892',
    createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
  });

  return [activeOrder, pastOrder1, pastOrder2];
}
