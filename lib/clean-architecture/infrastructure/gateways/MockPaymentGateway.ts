import { IPaymentGateway, PaymentResult } from '../../domain/repositories/IPaymentGateway';
import { Order } from '../../domain/entities/Order';
import { Money } from '../../domain/value-objects/Money';

/**
 * Mock implementation of IPaymentGateway.
 * Simulates university card balances, instant QR authorizations,
 * and standard debit/credit card processing.
 */
export class MockPaymentGateway implements IPaymentGateway {
  private studentBalances: Map<string, number> = new Map([
    ['2021-4892', 24500], // Sofía Mendoza's initial campus card balance
  ]);

  public getStudentBalance(studentId: string): number {
    return this.studentBalances.get(studentId) ?? 20000;
  }

  public rechargeBalance(studentId: string, amount: number): void {
    const current = this.getStudentBalance(studentId);
    this.studentBalances.set(studentId, current + amount);
  }

  public async processPayment(order: Order): Promise<PaymentResult> {
    const totalAmount = order.calculateTotal().amount;
    const paymentType = order.paymentDetails.type;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (paymentType === 'CARNE_ESTUDIANTIL') {
      const studentId = order.studentId;
      const currentBalance = this.getStudentBalance(studentId);

      if (currentBalance < totalAmount) {
        return {
          success: false,
          transactionId: `TX-FAILED-${Date.now()}`,
          errorMessage: `Saldo insuficiente en carné universitario ($${currentBalance.toLocaleString('es-CO')}). Requiere recarga.`,
        };
      }

      // Deduct balance
      this.studentBalances.set(studentId, currentBalance - totalAmount);

      return {
        success: true,
        transactionId: `TX-CARNE-${Date.now()}`,
        authorizationCode: `AUTH-UNI-${Math.floor(100000 + Math.random() * 900000)}`,
        receiptNumber: `REC-${order.id}`,
      };
    }

    // Credit Card, QR, or Digital Wallets
    return {
      success: true,
      transactionId: `TX-${paymentType}-${Date.now()}`,
      authorizationCode: `AUTH-EXT-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNumber: `REC-${order.id}`,
    };
  }

  public async refundPayment(orderId: string, amount: Money): Promise<{ success: boolean; refundId?: string }> {
    return {
      success: true,
      refundId: `REF-${orderId}-${Date.now()}`,
    };
  }
}
