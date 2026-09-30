import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { OrderOutputDTO } from '../dtos/OrderDTO';
import { DomainMapper } from '../mappers/DomainMapper';

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(orderId: string): Promise<OrderOutputDTO | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return null;
    return DomainMapper.toOrderDTO(order);
  }
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(limit?: number): Promise<OrderOutputDTO[]> {
    const orders = await this.orderRepository.findAll(limit);
    return orders.map((o) => DomainMapper.toOrderDTO(o));
  }
}
