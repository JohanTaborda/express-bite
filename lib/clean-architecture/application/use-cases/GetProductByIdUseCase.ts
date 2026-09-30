import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ProductOutputDTO } from '../dtos/OrderDTO';
import { DomainMapper } from '../mappers/DomainMapper';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(productId: string): Promise<ProductOutputDTO | null> {
    const product = await this.productRepository.findById(productId);
    if (!product) return null;
    return DomainMapper.toProductDTO(product);
  }
}
