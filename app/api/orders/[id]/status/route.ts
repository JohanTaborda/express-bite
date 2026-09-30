import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/clean-architecture/infrastructure/di/container';
import { OrderStatus } from '@/lib/clean-architecture/domain/value-objects/OrderStatus';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const nextStatus = body.status as OrderStatus;

    if (!nextStatus) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = await container.updateOrderStatusUseCase.execute(id, nextStatus);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating order status' },
      { status: 400 }
    );
  }
}
