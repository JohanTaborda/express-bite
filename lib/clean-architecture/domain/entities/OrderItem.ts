import { Product } from './Product';
import { Money } from '../value-objects/Money';

export interface OrderItemProps {
  id: string;
  product: Product;
  quantity: number;
  customizations?: string;
  unitPrice?: Money; // If overridden, otherwise inherits from product
}

/**
 * Domain Entity / Value Entity: OrderItem
 * Models a single line item within an order, with quantity and customizations.
 */
export class OrderItem {
  private readonly _id: string;
  private readonly _product: Product;
  private _quantity: number;
  private _customizations?: string;
  private readonly _unitPrice: Money;

  constructor(props: OrderItemProps) {
    if (!props.id) {
      throw new Error('OrderItem must have a unique identifier.');
    }
    if (props.quantity <= 0 || !Number.isInteger(props.quantity)) {
      throw new Error('OrderItem quantity must be a positive integer.');
    }

    this._id = props.id;
    this._product = props.product;
    this._quantity = props.quantity;
    this._customizations = props.customizations?.trim();
    this._unitPrice = props.unitPrice ?? props.product.price;
  }

  get id(): string { return this._id; }
  get product(): Product { return this._product; }
  get quantity(): number { return this._quantity; }
  get customizations(): string | undefined { return this._customizations; }
  get unitPrice(): Money { return this._unitPrice; }

  public setQuantity(quantity: number): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer.');
    }
    this._quantity = quantity;
  }

  public setCustomizations(notes: string): void {
    this._customizations = notes.trim();
  }

  public calculateSubtotal(): Money {
    return this._unitPrice.multiply(this._quantity);
  }
}
