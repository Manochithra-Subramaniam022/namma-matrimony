import fs from 'fs';
import path from 'path';

export interface DataRequestItem {
  id: string;
  targetProfileId: string;
  targetDisplayId?: string;
  targetName?: string;
  targetMobile?: string;
  requesterMobile: string;
  requesterName?: string;
  requesterDisplayId?: string;
  requestType: 'PHONE' | 'PHOTO' | 'BOTH';
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'data_requests.json');

// Ensure data directory exists
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('ensureDataFile error:', err);
  }
}

// Read all requests
export function getAllRequests(): DataRequestItem[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('getAllRequests error:', err);
    return [];
  }
}

// Save all requests atomically
export function saveAllRequests(requests: DataRequestItem[]): boolean {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('saveAllRequests error:', err);
    return false;
  }
}

// Normalize 10-digit mobile number
export function cleanMobileNumber(m?: string | null): string {
  if (!m) return '';
  return m.replace(/[^0-9]/g, '').slice(-10);
}

// 1. Get incoming requests for recipient (profile owner) by mobile or displayId/profileId
export function getIncomingRequests(recipientMobile?: string, targetIdOrDisplayId?: string): DataRequestItem[] {
  const all = getAllRequests();
  const cleanRecMobile = cleanMobileNumber(recipientMobile);

  return all.filter((r) => {
    if (targetIdOrDisplayId) {
      const matchTarget = (r.targetProfileId === targetIdOrDisplayId) || (r.targetDisplayId?.toLowerCase() === targetIdOrDisplayId.toLowerCase());
      if (matchTarget) return true;
    }
    if (cleanRecMobile) {
      const matchMob = cleanMobileNumber(r.targetMobile) === cleanRecMobile;
      if (matchMob) return true;
    }
    return false;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 2. Get sent requests by viewer
export function getSentRequests(requesterMobile: string): DataRequestItem[] {
  const all = getAllRequests();
  const cleanReqMobile = cleanMobileNumber(requesterMobile);
  if (!cleanReqMobile) return [];

  return all.filter((r) => cleanMobileNumber(r.requesterMobile) === cleanReqMobile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 3. Create or update request
export function createOrUpdateRequest(params: {
  targetProfileId: string;
  targetDisplayId?: string;
  targetName?: string;
  targetMobile?: string;
  requesterMobile: string;
  requesterName?: string;
  requesterDisplayId?: string;
  requestType: 'PHONE' | 'PHOTO' | 'BOTH';
  note?: string;
}): DataRequestItem {
  const all = getAllRequests();
  const cleanReq = cleanMobileNumber(params.requesterMobile);
  const targetId = params.targetProfileId;
  const targetDisp = params.targetDisplayId;

  // Check if existing request exists from this requester for this target
  const existingIdx = all.findIndex((r) => {
    const sameRequester = cleanMobileNumber(r.requesterMobile) === cleanReq;
    const sameTarget = (r.targetProfileId === targetId) || (targetDisp && r.targetDisplayId?.toLowerCase() === targetDisp.toLowerCase());
    return sameRequester && sameTarget;
  });

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const existing = all[existingIdx];
    const updated: DataRequestItem = {
      ...existing,
      requestType: params.requestType || existing.requestType,
      note: params.note !== undefined ? params.note : existing.note,
      status: existing.status === 'REJECTED' ? 'PENDING' : existing.status,
      updatedAt: now,
    };
    all[existingIdx] = updated;
    saveAllRequests(all);
    return updated;
  }

  const newRequest: DataRequestItem = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    targetProfileId: params.targetProfileId,
    targetDisplayId: params.targetDisplayId || undefined,
    targetName: params.targetName || 'மணமகன் / மணமகள்',
    targetMobile: cleanMobileNumber(params.targetMobile),
    requesterMobile: cleanReq,
    requesterName: params.requesterName?.trim() || 'பார்வையாளர் (Viewer)',
    requesterDisplayId: params.requesterDisplayId?.trim() || undefined,
    requestType: params.requestType || 'BOTH',
    note: params.note?.trim() || '',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newRequest);
  saveAllRequests(all);
  return newRequest;
}

// 4. Update request status (ACCEPTED | REJECTED)
export function updateRequestStatus(requestId: string, status: 'ACCEPTED' | 'REJECTED'): DataRequestItem | null {
  const all = getAllRequests();
  const idx = all.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  all[idx] = {
    ...all[idx],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveAllRequests(all);
  return all[idx];
}
