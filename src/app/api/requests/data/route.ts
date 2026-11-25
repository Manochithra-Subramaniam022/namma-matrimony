import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  DataRequestItem,
  getAllRequests,
  getIncomingRequests,
  getSentRequests,
  createOrUpdateRequest,
  updateRequestStatus,
  cleanMobileNumber,
} from '@/backend/data/dataRequestsStore';

export const dynamic = 'force-dynamic';

// 1. GET: Fetch incoming requests (for profile owner) or sent requests (for viewer)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile')?.trim();
    const requesterMobile = searchParams.get('requesterMobile')?.trim();
    const profileId = searchParams.get('profileId')?.trim();

    // Case A: Fetch for a specific profile by ID or Display ID
    if (profileId) {
      const requests = getIncomingRequests(undefined, profileId);
      return NextResponse.json({
        success: true,
        requests,
        unreadCount: requests.filter((r) => r.status === 'PENDING').length,
      });
    }

    // Case B: Fetch incoming requests for a user by their registered mobile
    if (mobile) {
      const cleanMob = cleanMobileNumber(mobile);

      // Also get any profile displayIds belonging to this mobile from Supabase to match requests
      let targetDisplayIds: string[] = [];
      try {
        const { data: userProfiles } = await supabase
          .from('Profile')
          .select('id, displayId, profileCreatedBy')
          .or(`profileCreatedBy.eq.${cleanMob},profileCreatedBy.ilike.%${cleanMob}%`);
        if (userProfiles && userProfiles.length > 0) {
          targetDisplayIds = userProfiles.map((p) => p.displayId || p.id).filter(Boolean);
        }
      } catch (err) {
        console.warn('Profile fetch for mobile warning:', err);
      }

      const all = getAllRequests();
      const receivedRequests = all.filter((r) => {
        const matchMob = cleanMobileNumber(r.targetMobile) === cleanMob;
        const matchDisplay = targetDisplayIds.some(
          (td) => td.toLowerCase() === (r.targetDisplayId || '').toLowerCase() || td === r.targetProfileId
        );
        return matchMob || matchDisplay;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        receivedRequests,
        unreadCount: receivedRequests.filter((r) => r.status === 'PENDING').length,
      });
    }

    // Case C: Fetch sent requests for a viewer by requesterMobile
    if (requesterMobile) {
      const sentRequests = getSentRequests(requesterMobile);
      return NextResponse.json({
        success: true,
        sentRequests,
      });
    }

    // Default: Return all requests (for admin view)
    const all = getAllRequests();
    return NextResponse.json({
      success: true,
      requests: all,
      unreadCount: all.filter((r) => r.status === 'PENDING').length,
    });
  } catch (err: any) {
    console.error('GET /api/requests/data error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// 2. POST: Viewer sends a new data request (req ph no and/or photo)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetProfileId,
      targetDisplayId,
      targetName,
      targetMobile,
      requesterMobile,
      requesterName,
      requesterDisplayId,
      requestType = 'BOTH',
      note = '',
    } = body || {};

    if (!targetProfileId || !requesterMobile) {
      return NextResponse.json(
        { success: false, error: 'targetProfileId and requesterMobile are required' },
        { status: 400 }
      );
    }

    // Resolve target profile details if not provided
    let resolvedTargetDisplayId = targetDisplayId;
    let resolvedTargetName = targetName;
    let resolvedTargetMobile = targetMobile;

    if (!resolvedTargetDisplayId || !resolvedTargetName || !resolvedTargetMobile) {
      try {
        const { data: p } = await supabase
          .from('Profile')
          .select('id, name, displayId, profileCreatedBy, userContact:User(mobile_no)')
          .or(`id.eq.${targetProfileId},displayId.eq.${targetProfileId}`)
          .maybeSingle();

        if (p) {
          resolvedTargetDisplayId = resolvedTargetDisplayId || p.displayId;
          resolvedTargetName = resolvedTargetName || p.name;
          resolvedTargetMobile = resolvedTargetMobile || p.profileCreatedBy || (p.userContact as any)?.mobile_no;
        }
      } catch (e) {
        console.warn('Profile lookup warning in request POST:', e);
      }
    }

    const savedRequest = createOrUpdateRequest({
      targetProfileId,
      targetDisplayId: resolvedTargetDisplayId,
      targetName: resolvedTargetName,
      targetMobile: resolvedTargetMobile,
      requesterMobile,
      requesterName,
      requesterDisplayId,
      requestType: requestType as any,
      note,
    });

    return NextResponse.json({
      success: true,
      message: 'தகவல் அனுமதி கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது (Data request sent successfully)',
      request: savedRequest,
    });
  } catch (err: any) {
    console.error('POST /api/requests/data error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// 3. PATCH: Profile owner accepts or declines a request
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, status } = body || {};

    if (!requestId || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'requestId and valid status (ACCEPTED|REJECTED) are required' },
        { status: 400 }
      );
    }

    const updated = updateRequestStatus(requestId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'ACCEPTED'
        ? 'தகவல் அனுமதி வெற்றிகரமாக வழங்கப்பட்டது (Access granted)'
        : 'தகவல் கோரிக்கை நிராகரிக்கப்பட்டது (Request declined)',
      request: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/requests/data error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
