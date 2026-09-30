import { Order } from '../entities/Order';

/**
 * Interface Segregation Principle (ISP) & Dependency Inversion Principle (DIP).
 * Domain repository contract for Order persistence.
 */
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByTicketNumber(ticketNumber: string): Promise<Order | null>;
  findAll(limit?: number): Promise<Order[]>;
  findActiveByStudentId(studentId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
}
