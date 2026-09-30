import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IPaymentGateway } from '../../domain/repositories/IPaymentGateway';
import { OrderStatus } from '../../domain/value-objects/OrderStatus';
import { OrderOutputDTO } from '../dtos/OrderDTO';
import { DomainMapper } from '../mappers/DomainMapper';

/**
 * Use Case: UpdateOrderStatusUseCase
 * Handles barista or kitchen station state transitions (RECEIVED -> PREPARING -> READY -> DELIVERED).
 * Validates domain rules before persistence.
 */
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(orderId: string, nextStatus: OrderStatus): Promise<OrderOutputDTO> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    order.transitionTo(nextStatus);
    await this.orderRepository.update(order);

    return DomainMapper.toOrderDTO(order);
  }
}

/**
 * Use Case: CancelOrderUseCase
 * Cancels active order and triggers refund if applicable.
 */
export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  public async execute(orderId: string, reason?: string): Promise<OrderOutputDTO> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (!order.canBeCancelled()) {
      throw new Error(`El pedido ${orderId} no puede ser cancelado en su estado actual (${order.status}).`);
    }

    order.cancel(reason);

    // Refund logic through payment gateway
    await this.paymentGateway.refundPayment(order.id, order.calculateTotal());
    await this.orderRepository.update(order);

    return DomainMapper.toOrderDTO(order);
  }
}
