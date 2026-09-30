import { OrderItem } from './OrderItem';
import { Money } from '../value-objects/Money';
import { OrderStatus, OrderStatusValidator } from '../value-objects/OrderStatus';
import { PaymentDetails } from '../value-objects/PaymentMethod';
import { PickupStation } from '../value-objects/PickupStation';

export interface OrderProps {
  id: string;
  ticketNumber: string;
  items: OrderItem[];
  status?: OrderStatus;
  pickupStation: PickupStation;
  paymentDetails: PaymentDetails;
  studentName: string;
  studentId: string;
  instructions?: string;
  pickupTimeMode?: 'NOW' | 'SCHEDULED';
  scheduledTime?: string;
  createdAt?: Date;
  updatedAt?: Date;
  estimatedReadyAt?: Date;
}

/**
 * Domain Aggregate Root: Order
 * Encapsulates the entire ordering lifecycle, state transitions, total and discount
 * calculations, and invariants.
 * Adheres to Clean Architecture, SOLID and DDD principles.
 */
export class Order {
  private readonly _id: string;
  private readonly _ticketNumber: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _pickupStation: PickupStation;
  private _paymentDetails: PaymentDetails;
  private _studentName: string;
  private _studentId: string;
  private _instructions?: string;
  private _pickupTimeMode: 'NOW' | 'SCHEDULED';
  private _scheduledTime?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _estimatedReadyAt: Date;

  constructor(props: OrderProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error('Order must have a valid identifier.');
    }
    if (!props.ticketNumber || props.ticketNumber.trim().length === 0) {
      throw new Error('Order must have a designated ticket number.');
    }
    if (!props.items || props.items.length === 0) {
      throw new Error('An order must contain at least one item.');
    }

    this._id = props.id;
    this._ticketNumber = props.ticketNumber;
    this._items = [...props.items];
    this._status = props.status ?? 'RECEIVED';
    this._pickupStation = props.pickupStation;
    this._paymentDetails = props.paymentDetails;
    this._studentName = props.studentName;
    this._studentId = props.studentId;
    this._instructions = props.instructions;
    this._pickupTimeMode = props.pickupTimeMode ?? 'NOW';
    this._scheduledTime = props.scheduledTime;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    // Default estimated ready time: 8-12 minutes from creation
    const readyDate = props.estimatedReadyAt ?? new Date(this._createdAt.getTime() + 10 * 60 * 1000);
    this._estimatedReadyAt = readyDate;
  }

  // Getters
  get id(): string { return this._id; }
  get ticketNumber(): string { return this._ticketNumber; }
  get items(): ReadonlyArray<OrderItem> { return [...this._items]; }
  get status(): OrderStatus { return this._status; }
  get pickupStation(): PickupStation { return this._pickupStation; }
  get paymentDetails(): PaymentDetails { return this._paymentDetails; }
  get studentName(): string { return this._studentName; }
  get studentId(): string { return this._studentId; }
  get instructions(): string | undefined { return this._instructions; }
  get pickupTimeMode(): 'NOW' | 'SCHEDULED' { return this._pickupTimeMode; }
  get scheduledTime(): string | undefined { return this._scheduledTime; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get estimatedReadyAt(): Date { return this._estimatedReadyAt; }

  // Business calculations
  public calculateSubtotal(): Money {
    return this._items.reduce(
      (accum, item) => accum.add(item.calculateSubtotal()),
      Money.zero()
    );
  }

  public calculateDiscount(): Money {
    const subtotal = this.calculateSubtotal();
    const discountPercent = this._paymentDetails.discountPercentage || 0;
    if (discountPercent <= 0) {
      return Money.zero();
    }
    return subtotal.percentage(discountPercent);
  }

  public calculateTotal(): Money {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    return subtotal.subtract(discount);
  }

  public calculateLoyaltyPoints(): number {
    // 1 point per 100 COP spent
    const totalAmount = this.calculateTotal().amount;
    return Math.floor(totalAmount / 100);
  }

  public getTotalItemCount(): number {
    return this._items.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Domain Lifecycle State Transitions
  public transitionTo(nextStatus: OrderStatus): void {
    if (!OrderStatusValidator.canTransition(this._status, nextStatus)) {
      throw new Error(
        `Invalid order status transition from ${this._status} to ${nextStatus}.`
      );
    }
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public canBeCancelled(): boolean {
    return this._status === 'RECEIVED' || this._status === 'PREPARING';
  }

  public cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        `Order ${this._id} cannot be cancelled in status ${this._status}.`
      );
    }
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
    if (reason) {
      this._instructions = this._instructions
        ? `${this._instructions} [Cancelado: ${reason}]`
        : `[Cancelado: ${reason}]`;
    }
  }

  public addItem(item: OrderItem): void {
    if (this._status !== 'RECEIVED') {
      throw new Error('Cannot modify items once order preparation has begun.');
    }
    this._items.push(item);
    this._updatedAt = new Date();
  }

  public removeItem(itemId: string): void {
    if (this._status !== 'RECEIVED') {
      throw new Error('Cannot modify items once order preparation has begun.');
    }
    if (this._items.length <= 1) {
      throw new Error('Order must contain at least one item.');
    }
    this._items = this._items.filter(i => i.id !== itemId);
    this._updatedAt = new Date();
  }
}
