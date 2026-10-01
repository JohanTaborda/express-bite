import { Money } from '../value-objects/Money';

export type ProductCategory = 
  | 'TODOS'
  | 'CAFE_ESPECIALIDAD'
  | 'BEBIDAS_FRIAS'
  | 'REPOSTERIA'
  | 'SANDWICHES_SALADOS'
  | 'COMBOS_ESTUDIANTILES';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  TODOS: 'Todos los Menús',
  CAFE_ESPECIALIDAD: 'Café de Especialidad',
  BEBIDAS_FRIAS: 'Bebidas Frías y Frappés',
  REPOSTERIA: 'Bakery y Repostería',
  SANDWICHES_SALADOS: 'Sándwiches y Salados',
  COMBOS_ESTUDIANTILES: 'Combos Estudiantiles',
};

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  category: ProductCategory;
  imageUrl: string;
  preparationTimeMinutes: number;
  calories: number;
  dietaryBadge?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  stockQuantity?: number;
  tags?: string[];
}

/**
 * Domain Entity: Product
 * Encapsulates core business rules, price invariants, and inventory constraints.
 * Follows Single Responsibility Principle (SRP).
 */
export class Product {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _price: Money;
  private _category: ProductCategory;
  private _imageUrl: string;
  private _preparationTimeMinutes: number;
  private _calories: number;
  private _dietaryBadge?: string;
  private _isAvailable: boolean;
  private _isPopular: boolean;
  private _stockQuantity: number;
  private _tags: string[];

  constructor(props: ProductProps) {
    this.validateProps(props);

    this._id = props.id;
    this._name = props.name.trim();
    this._description = props.description.trim();
    this._price = props.price;
    this._category = props.category;
    this._imageUrl = props.imageUrl;
    this._preparationTimeMinutes = props.preparationTimeMinutes;
    this._calories = props.calories;
    this._dietaryBadge = props.dietaryBadge;
    this._isAvailable = props.isAvailable ?? true;
    this._isPopular = props.isPopular ?? false;
    this._stockQuantity = props.stockQuantity ?? 50;
    this._tags = props.tags ?? [];
  }

  private validateProps(props: ProductProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error('Product must have a valid identifier.');
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters long.');
    }
    if (props.preparationTimeMinutes < 0) {
      throw new Error('Preparation time cannot be negative.');
    }
    if (props.calories < 0) {
      throw new Error('Calories cannot be negative.');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get price(): Money { return this._price; }
  get category(): ProductCategory { return this._category; }
  get imageUrl(): string { return this._imageUrl; }
  get preparationTimeMinutes(): number { return this._preparationTimeMinutes; }
  get calories(): number { return this._calories; }
  get dietaryBadge(): string | undefined { return this._dietaryBadge; }
  get isAvailable(): boolean { return this._isAvailable && this._stockQuantity > 0; }
  get isPopular(): boolean { return this._isPopular; }
  get stockQuantity(): number { return this._stockQuantity; }
  get tags(): string[] { return [...this._tags]; }

  // Business logic methods
  public decreaseStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount to decrease must be greater than zero.');
    }
    if (amount > this._stockQuantity) {
      throw new Error(`Insufficient stock for product ${this._name}. Available: ${this._stockQuantity}, requested: ${amount}`);
    }
    this._stockQuantity -= amount;
    if (this._stockQuantity === 0) {
      this._isAvailable = false;
    }
  }

  public increaseStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount to increase must be greater than zero.');
    }
    this._stockQuantity += amount;
    if (this._stockQuantity > 0) {
      this._isAvailable = true;
    }
  }

  public setAvailability(available: boolean): void {
    this._isAvailable = available;
  }

  public updatePrice(newPrice: Money): void {
    this._price = newPrice;
  }
}
