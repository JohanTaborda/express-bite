import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product, ProductCategory } from '../../domain/entities/Product';
import { createMockProducts } from '../seed/mockProductsData';

/**
 * Infrastructure implementation of IProductRepository.
 * Adheres to Liskov Substitution Principle (LSP) and Dependency Inversion Principle (DIP).
 */
export class MockProductRepository implements IProductRepository {
  private products: Map<string, Product>;

  constructor(initialProducts?: Product[]) {
    const list = initialProducts || createMockProducts();
    this.products = new Map(list.map((p) => [p.id, p]));
  }

  public async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  public async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product || null;
  }

  public async findByCategory(category: ProductCategory): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.category === category);
  }

  public async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase().trim();
    return Array.from(this.products.values()).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  public async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }
}
