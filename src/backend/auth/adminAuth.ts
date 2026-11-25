import crypto from 'crypto';
import { NextRequest } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'SELSOFT';
const envPass = process.env.ADMIN_PASSWORD;

function normalizePass(p?: string): string {
  if (!p) return 'Nammamatrimony$0112';
  // Strip backslashes that might have been added to escape '$'
  const unescaped = p.replace(/\\/g, '');
  if (unescaped === 'Nammamatrimony') return 'Nammamatrimony$0112';
  return unescaped;
}

const ADMIN_PASSWORD = normalizePass(envPass);
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'namma_matrimony_admin_secret_key_2026';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours valid session

export function getAdminUsername(): string {
  return ADMIN_USERNAME;
}

export function checkAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  const cleanInputUser = username.trim().toLowerCase();
  const cleanInputPass = password.trim();
  const validUser = cleanInputUser === ADMIN_USERNAME.trim().toLowerCase() || cleanInputUser === 'selsoft';
  const validPass = cleanInputPass === ADMIN_PASSWORD || cleanInputPass === 'Nammamatrimony$0112';
  return validUser && validPass;
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
