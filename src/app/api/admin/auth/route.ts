import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminCredentials,
  createAdminToken,
  verifyAdminRequest,
  getAdminUsername,
} from '@/backend/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isValid = verifyAdminRequest(req);
    return NextResponse.json({
      success: isValid,
      authenticated: isValid,
      username: isValid ? getAdminUsername() : null,
    });
  } catch (err: any) {
    console.error('GET /api/admin/auth error:', err);
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!checkAdminCredentials(username, password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'தவறான நிர்வாக பயனர் பெயர் அல்லது கடவுச்சொல் (Invalid admin username or password)',
        },
        { status: 401 }
      );
    }

    const token = createAdminToken(username || 'admin');

    const res = NextResponse.json({
      success: true,
      message: 'நிர்வாக உள்நுழைவு வெற்றிகரமானது (Admin login successful)',
      token,
      username: username || 'admin',
    });

    // Set HTTP-Only Cookie with 24h validity
    res.cookies.set({
      name: 'namma_admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch (err: any) {
    console.error('POST /api/admin/auth error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: 'நிர்வாக கணக்கிலிருந்து வெளியேறப்பட்டது (Logged out)',
  });

  res.cookies.set({
    name: 'namma_admin_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}
