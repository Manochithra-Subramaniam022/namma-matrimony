import { NextRequest, NextResponse } from 'next/server';
import { registerProfileWithPrisma, getNextRegistrationId } from '@/backend/actions/registration';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const nextId = await getNextRegistrationId();
    return NextResponse.json({ success: true, nextId });
  } catch (err: any) {
    return NextResponse.json({ success: false, nextId: 'nm-0001' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await registerProfileWithPrisma(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal server error',
    }, { status: 500 });
  }
}
