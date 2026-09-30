import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

/**
 * Infrastructure implementation of IOrderRepository.
 * Manages orders in-memory with ordering by date, lookup by ID, ticket, and student.
 */
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  constructor(initialOrders?: Order[]) {
    if (initialOrders) {
      initialOrders.forEach((order) => {
        this.orders.set(order.id, order);
      });
    }
  }

  public async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  public async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  public async findByTicketNumber(ticketNumber: string): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.ticketNumber === ticketNumber) {
        return order;
      }
    }
    return null;
  }

  public async findAll(limit?: number): Promise<Order[]> {
    const all = Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return limit ? all.slice(0, limit) : all;
  }

  public async findActiveByStudentId(studentId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.studentId === studentId && o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async update(order: Order): Promise<void> {
    if (!this.orders.has(order.id)) {
      throw new Error(`Cannot update non-existent order ${order.id}`);
    }
    this.orders.set(order.id, order);
  }
}
