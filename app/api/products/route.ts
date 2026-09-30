import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/clean-architecture/infrastructure/di/container';
import { ProductCategory } from '@/lib/clean-architecture/domain/entities/Product';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as ProductCategory | null;
    const query = searchParams.get('q') || undefined;
    const tag = searchParams.get('tag') || undefined;

    const products = await container.getProductsUseCase.execute({
      category: category || undefined,
      searchQuery: query,
      tag,
    });

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching products' },
      { status: 500 }
    );
  }
}
