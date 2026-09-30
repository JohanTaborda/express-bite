/**
 * Domain Enum and transitions for Order Status Lifecycle.
 * Implements finite state machine validation to preserve invariants.
 */
export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  stepNumber: number;
  description: string;
  badgeColor: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusInfo> = {
  RECEIVED: {
    status: 'RECEIVED',
    label: '1. Recibido',
    stepNumber: 1,
    description: 'Comprobado en cocina',
    badgeColor: 'bg-primary text-on-primary',
  },
  PREPARING: {
    status: 'PREPARING',
    label: '2. En Proceso',
    stepNumber: 2,
    description: 'Barista preparando orden',
    badgeColor: 'bg-secondary text-on-secondary',
  },
  READY: {
    status: 'READY',
    label: '3. Listo',
    stepNumber: 3,
    description: 'En mostrador para retiro',
    badgeColor: 'bg-[#2E6B47] text-white',
  },
  DELIVERED: {
    status: 'DELIVERED',
    label: '4. Entregado',
    stepNumber: 4,
    description: 'Escaneo en mostrador completado',
    badgeColor: 'bg-surface-container-high text-on-surface-variant',
  },
  CANCELLED: {
    status: 'CANCELLED',
    label: 'Cancelado',
    stepNumber: 0,
    description: 'Pedido cancelado',
    badgeColor: 'bg-error text-on-error',
  },
};

/**
 * Domain validation for allowable status transitions.
 */
export class OrderStatusValidator {
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    RECEIVED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED'],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
  };

  public static canTransition(current: OrderStatus, next: OrderStatus): boolean {
    const validNextStates = this.ALLOWED_TRANSITIONS[current] || [];
    return validNextStates.includes(next);
  }

  public static isTerminal(status: OrderStatus): boolean {
    return status === 'DELIVERED' || status === 'CANCELLED';
  }
}
