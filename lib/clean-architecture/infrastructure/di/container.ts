import { MockProductRepository } from '../repositories/MockProductRepository';
import { InMemoryOrderRepository } from '../repositories/InMemoryOrderRepository';
import { MockPaymentGateway } from '../gateways/MockPaymentGateway';
import { createMockProducts } from '../seed/mockProductsData';
import { createMockOrders } from '../seed/mockOrdersData';

import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/GetProductByIdUseCase';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { GetOrderByIdUseCase, ListOrdersUseCase } from '../../application/use-cases/GetAndListOrdersUseCase';
import { UpdateOrderStatusUseCase, CancelOrderUseCase } from '../../application/use-cases/UpdateOrderStatusUseCase';

/**
 * Composition Root / Dependency Injection Container
 * Resolves abstractions to concrete implementations.
 * Enables adherence to the Dependency Inversion Principle (DIP).
 */
class ServiceContainer {
  private static instance: ServiceContainer;

  public readonly productRepository: MockProductRepository;
  public readonly orderRepository: InMemoryOrderRepository;
  public readonly paymentGateway: MockPaymentGateway;

  public readonly getProductsUseCase: GetProductsUseCase;
  public readonly getProductByIdUseCase: GetProductByIdUseCase;
  public readonly createOrderUseCase: CreateOrderUseCase;
  public readonly getOrderByIdUseCase: GetOrderByIdUseCase;
  public readonly listOrdersUseCase: ListOrdersUseCase;
  public readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  public readonly cancelOrderUseCase: CancelOrderUseCase;

  private constructor() {
    // 1. Initialize Seed Products & Repository
    const seedProducts = createMockProducts();
    this.productRepository = new MockProductRepository(seedProducts);

    // 2. Initialize Seed Orders & Repository
    const seedOrders = createMockOrders(seedProducts);
    this.orderRepository = new InMemoryOrderRepository(seedOrders);

    // 3. Initialize Gateways
    this.paymentGateway = new MockPaymentGateway();

    // 4. Wire Use Cases
    this.getProductsUseCase = new GetProductsUseCase(this.productRepository);
    this.getProductByIdUseCase = new GetProductByIdUseCase(this.productRepository);
    this.createOrderUseCase = new CreateOrderUseCase(
      this.orderRepository,
      this.productRepository,
      this.paymentGateway
    );
    this.getOrderByIdUseCase = new GetOrderByIdUseCase(this.orderRepository);
    this.listOrdersUseCase = new ListOrdersUseCase(this.orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(this.orderRepository);
    this.cancelOrderUseCase = new CancelOrderUseCase(
      this.orderRepository,
      this.paymentGateway
    );
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
}

export const container = ServiceContainer.getInstance();
