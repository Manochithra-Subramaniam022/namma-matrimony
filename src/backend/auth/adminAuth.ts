import crypto from 'crypto';
import { NextRequest } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'SELSOFT';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Nammamatrimony$0112';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'namma_matrimony_admin_secret_key_2026';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours valid session

export function getAdminUsername(): string {
  return ADMIN_USERNAME;
}

export function checkAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return username.trim().toLowerCase() === ADMIN_USERNAME.trim().toLowerCase() && password.trim() === ADMIN_PASSWORD.trim();
}

export function createAdminToken(username = 'SELSOFT'): string {
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [username, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
      return false;
    }
    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(`${username}:${timestampStr}`).digest('hex');
    if (hmac.length !== expectedHmac.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export function verifyAdminRequest(req: NextRequest): boolean {
  // 1. Check HTTP-Only Cookie
  const cookieToken = req.cookies.get('namma_admin_token')?.value;
  if (cookieToken && verifyAdminToken(cookieToken)) return true;

  // 2. Check Custom Header
  const headerToken = req.headers.get('x-admin-token');
  if (headerToken && verifyAdminToken(headerToken)) return true;

  // 3. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    if (bearerToken && verifyAdminToken(bearerToken)) return true;
  }

  return false;
}
