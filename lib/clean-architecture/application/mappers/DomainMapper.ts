import { Order } from '../../domain/entities/Order';
import { Product, PRODUCT_CATEGORY_LABELS } from '../../domain/entities/Product';
import { ORDER_STATUS_MAP } from '../../domain/value-objects/OrderStatus';
import { OrderOutputDTO, OrderItemOutputDTO, ProductOutputDTO } from '../dtos/OrderDTO';

export class DomainMapper {
  public static toProductDTO(product: Product): ProductOutputDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.amount,
      formattedPrice: product.price.format(),
      category: product.category,
      categoryLabel: PRODUCT_CATEGORY_LABELS[product.category] || product.category.replace(/_/g, ' '),
      imageUrl: product.imageUrl,
      preparationTimeMinutes: product.preparationTimeMinutes,
      calories: product.calories,
      dietaryBadge: product.dietaryBadge,
      isAvailable: product.isAvailable,
      isPopular: product.isPopular,
      stockQuantity: product.stockQuantity,
      tags: product.tags,
    };
  }

  public static toOrderDTO(order: Order): OrderOutputDTO {
    const statusInfo = ORDER_STATUS_MAP[order.status];

    const itemsDTO: OrderItemOutputDTO[] = order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      customizations: item.customizations,
      unitPrice: item.unitPrice.amount,
      subtotal: item.calculateSubtotal().amount,
      formattedSubtotal: item.calculateSubtotal().format(),
    }));

    const subtotal = order.calculateSubtotal();
    const discount = order.calculateDiscount();
    const total = order.calculateTotal();

    return {
      id: order.id,
      ticketNumber: order.ticketNumber,
      status: order.status,
      statusLabel: statusInfo.label,
      stepNumber: statusInfo.stepNumber,
      studentName: order.studentName,
      studentId: order.studentId,
      pickupStation: {
        id: order.pickupStation.id,
        name: order.pickupStation.name,
        building: order.pickupStation.building,
        floor: order.pickupStation.floor,
      },
      paymentMethod: {
        type: order.paymentDetails.type,
        label: order.paymentDetails.label,
        discountPercentage: order.paymentDetails.discountPercentage,
      },
      items: itemsDTO,
      subtotal: subtotal.amount,
      discount: discount.amount,
      total: total.amount,
      loyaltyPoints: order.calculateLoyaltyPoints(),
      formattedSubtotal: subtotal.format(),
      formattedDiscount: discount.format(),
      formattedTotal: total.format(),
      instructions: order.instructions,
      pickupTimeMode: order.pickupTimeMode,
      scheduledTime: order.scheduledTime,
      createdAt: order.createdAt.toISOString(),
      estimatedReadyAt: order.estimatedReadyAt.toISOString(),
      canBeCancelled: order.canBeCancelled(),
    };
  }
}
