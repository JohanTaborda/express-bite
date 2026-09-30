import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/clean-architecture/infrastructure/di/container';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || '2021-4892';
    const balance = container.paymentGateway.getStudentBalance(studentId);

    return NextResponse.json({
      success: true,
      studentId,
      balance,
      formattedBalance: `$${balance.toLocaleString('es-CO')}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = body.studentId || '2021-4892';
    const amount = Number(body.amount) || 20000;

    container.paymentGateway.rechargeBalance(studentId, amount);
    const newBalance = container.paymentGateway.getStudentBalance(studentId);

    return NextResponse.json({
      success: true,
      studentId,
      newBalance,
      formattedBalance: `$${newBalance.toLocaleString('es-CO')}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
