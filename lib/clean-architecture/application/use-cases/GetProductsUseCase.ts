import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ProductCategory } from '../../domain/entities/Product';
import { ProductOutputDTO } from '../dtos/OrderDTO';
import { DomainMapper } from '../mappers/DomainMapper';

export interface GetProductsFilter {
  category?: ProductCategory | 'TODOS';
  searchQuery?: string;
  tag?: string;
}

/**
 * Use Case: GetProductsUseCase
 * Single Responsibility: Retrieving products according to filters (category, search text, dietary tags).
 * Adheres to Dependency Inversion Principle (depends on IProductRepository interface).
 */
export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(filter?: GetProductsFilter): Promise<ProductOutputDTO[]> {
    let products = await this.productRepository.findAll();

    if (filter?.category && filter.category !== 'TODOS') {
      products = products.filter((p) => p.category === filter.category);
    }

    if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filter?.tag) {
      products = products.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === filter.tag?.toLowerCase())
      );
    }

    return products.map((p) => DomainMapper.toProductDTO(p));
  }
}
