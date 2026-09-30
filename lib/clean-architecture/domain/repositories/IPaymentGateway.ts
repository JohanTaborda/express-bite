import { Order } from '../entities/Order';
import { Money } from '../value-objects/Money';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  authorizationCode?: string;
  receiptNumber?: string;
  errorMessage?: string;
}

/**
 * Port for payment processing.
 * Demonstrates Dependency Inversion Principle (DIP).
 */
export interface IPaymentGateway {
  processPayment(order: Order): Promise<PaymentResult>;
  refundPayment(orderId: string, amount: Money): Promise<{ success: boolean; refundId?: string }>;
}
