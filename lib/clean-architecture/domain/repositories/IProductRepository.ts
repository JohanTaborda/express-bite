import { Product, ProductCategory } from '../entities/Product';

/**
 * Interface Segregation Principle (ISP) & Dependency Inversion Principle (DIP).
 * Domain repository contract for Product storage and retrieval.
 */
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(category: ProductCategory): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
