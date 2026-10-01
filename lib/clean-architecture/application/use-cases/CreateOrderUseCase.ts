import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IPaymentGateway } from '../../domain/repositories/IPaymentGateway';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { CAMPUS_STATIONS } from '../../domain/value-objects/PickupStation';
import { PAYMENT_METHODS } from '../../domain/value-objects/PaymentMethod';
import { CreateOrderInputDTO, OrderOutputDTO } from '../dtos/OrderDTO';
import { DomainMapper } from '../mappers/DomainMapper';

/**
 * Use Case: CreateOrderUseCase
 * Coordinates product validation, stock deduction, payment processing,
 * and order persistence.
 * Demonstrates:
 * - Single Responsibility Principle (SRP): Only orchestrates order creation workflow.
 * - Dependency Inversion Principle (DIP): Injected with repository and gateway interfaces.
 */
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  public async execute(input: CreateOrderInputDTO): Promise<OrderOutputDTO> {
    if (!input.items || input.items.length === 0) {
      throw new Error('No se puede crear un pedido sin productos en la bandeja.');
    }

    // 1. Resolve and validate products and build OrderItems
    const orderItems: OrderItem[] = [];

    for (const itemInput of input.items) {
      const product = await this.productRepository.findById(itemInput.productId);
      if (!product) {
        throw new Error(`Producto con ID ${itemInput.productId} no encontrado.`);
      }
      if (!product.isAvailable) {
        throw new Error(`El producto "${product.name}" no está disponible en este momento.`);
      }

      // Check stock and decrease
      product.decreaseStock(itemInput.quantity);
      await this.productRepository.save(product);

      const orderItem = new OrderItem({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product,
        quantity: itemInput.quantity,
        customizations: itemInput.customizations,
        unitPrice: product.price,
      });

      orderItems.push(orderItem);
    }

    // 2. Resolve Pickup Station
    const station =
      CAMPUS_STATIONS.find((s) => s.id === input.pickupStationId) || CAMPUS_STATIONS[0];

    // 3. Resolve Payment Details
    const methodMeta = PAYMENT_METHODS[input.paymentType] || PAYMENT_METHODS.CARNE_ESTUDIANTIL;
    const paymentDetails = {
      type: input.paymentType,
      label: methodMeta.label,
      discountPercentage: methodMeta.discount,
      studentId: input.studentId,
    };

    // 4. Generate Order ID and Turn Ticket
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `QB-${randomSuffix}`;
    const ticketTurn = `B-${Math.floor(20 + Math.random() * 80)}`;

    // 5. Construct Order Aggregate Root
    const order = new Order({
      id: orderId,
      ticketNumber: ticketTurn,
      items: orderItems,
      status: 'RECEIVED',
      pickupStation: station,
      paymentDetails,
      studentName: input.studentName || 'Johan David Taborda',
      studentId: input.studentId || '2024-1088',
      instructions: input.instructions,
      pickupTimeMode: input.pickupTimeMode ?? 'NOW',
      scheduledTime: input.scheduledTime,
    });

    // 6. Process Payment via Gateway (DIP)
    const paymentResult = await this.paymentGateway.processPayment(order);
    if (!paymentResult.success) {
      throw new Error(`Fallo en el procesamiento del pago: ${paymentResult.errorMessage || 'Error desconocido'}`);
    }

    // 7. Save Order to Repository
    await this.orderRepository.save(order);

    return DomainMapper.toOrderDTO(order);
  }
}
