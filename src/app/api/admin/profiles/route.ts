import { NextRequest, NextResponse } from 'next/server';
import { getAllProfilesForAdmin, updateProfileStatus } from '@/backend/actions/admin';
import { deleteProfile } from '@/backend/actions/registration';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender') || 'ALL';

    const result = await getAllProfilesForAdmin({ status, search, gender });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API GET /api/admin/profiles error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error', profiles: [] },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, status, rejectedReason, approvedBy } = body;

    if (!profileId || !status) {
      return NextResponse.json(
        { success: false, error: 'profileId and status are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be APPROVED, REJECTED, or PENDING' },
        { status: 400 }
      );
    }

    const result = await updateProfileStatus({
      profileId,
      status,
      rejectedReason,
      approvedBy,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API PATCH /api/admin/profiles error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
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
        // Body was not json
      }
    }

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required for deletion' },
        { status: 400 }
      );
    }

    const result = await deleteProfile(targetId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API DELETE /api/admin/profiles error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

