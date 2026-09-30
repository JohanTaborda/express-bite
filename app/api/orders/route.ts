import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/clean-architecture/infrastructure/di/container';
import { CreateOrderInputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const orders = await container.listOrdersUseCase.execute(limit);
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderInputDTO = await req.json();
    const createdOrder = await container.createOrderUseCase.execute(body);

    return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error creating order' },
      { status: 400 }
    );
  }
}
