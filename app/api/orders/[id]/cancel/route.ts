import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/clean-architecture/infrastructure/di/container';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason as string | undefined;

    const cancelledOrder = await container.cancelOrderUseCase.execute(id, reason);
    return NextResponse.json({ success: true, data: cancelledOrder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error cancelling order' },
      { status: 400 }
    );
  }
}
