import { NextRequest, NextResponse } from 'next/server';
import {
  registerProfileWithPrisma,
  getNextRegistrationId,
  getProfilesByMobile,
  getProfileById,
  deleteProfile,
} from '@/backend/actions/registration';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');
    const id = searchParams.get('id');

    if (id) {
      const profile = await getProfileById(id);
      return NextResponse.json({ success: true, profile });
    }

    if (mobile) {
      const profiles = await getProfilesByMobile(mobile);
      return NextResponse.json({ success: true, profiles });
    }

    const nextId = await getNextRegistrationId();
    return NextResponse.json({ success: true, nextId });
  } catch (err: any) {
    console.error('API GET /api/register error:', err);
    return NextResponse.json({ success: false, nextId: 'nm-0001', error: err.message });
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let targetId = searchParams.get('id') || searchParams.get('displayId');

    if (!targetId) {
      try {
        const body = await req.json();
        targetId = body.id || body.displayId || body.profileId;
      } catch {
        // Body was empty or not json
      }
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Profile ID is required to delete' }, { status: 400 });
    }

    const result = await deleteProfile(targetId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API DELETE /api/register error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal server error',
    }, { status: 500 });
  }
}
