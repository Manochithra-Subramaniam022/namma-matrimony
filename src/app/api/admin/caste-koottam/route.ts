import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CASTE_KOOTTAM_MAP, CasteKoottamConfig } from '@/constants/casteKoottam';
import { verifyAdminRequest } from '@/backend/auth/adminAuth';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'caste-koottam.json');

// In-memory cache for fast lookups
let inMemoryConfig: CasteKoottamConfig | null = null;

function loadConfig(): CasteKoottamConfig {
  try {
    if (inMemoryConfig && Object.keys(inMemoryConfig).length > 0) {
      return inMemoryConfig;
    }

    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        // Merge with defaults to ensure all castes always have lists
        const merged: CasteKoottamConfig = { ...DEFAULT_CASTE_KOOTTAM_MAP, ...parsed };
        inMemoryConfig = merged;
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to read caste-koottam.json, using defaults', err);
  }

  const fallback: CasteKoottamConfig = { ...DEFAULT_CASTE_KOOTTAM_MAP };
  inMemoryConfig = fallback;
  saveConfig(fallback);
  return fallback;
}

function saveConfig(config: CasteKoottamConfig): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    inMemoryConfig = config;
    return true;
  } catch (err) {
    console.error('Failed to save caste-koottam.json', err);
    inMemoryConfig = config;
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caste = searchParams.get('caste');

    const config = loadConfig();

    if (caste) {
      const koottams = config[caste] || DEFAULT_CASTE_KOOTTAM_MAP[caste] || [];
      return NextResponse.json({ success: true, caste, koottams });
    }

    return NextResponse.json({
      success: true,
      config,
      totalCastes: Object.keys(config).length
    });
  } catch (err: any) {
    console.error('GET /api/admin/caste-koottam error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error', config: DEFAULT_CASTE_KOOTTAM_MAP },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const config = { ...loadConfig() };

    const { action, caste, koottam, koottams, newConfig } = body;

    // Full config replacement / bulk save
    if (newConfig && typeof newConfig === 'object') {
      saveConfig(newConfig);
      return NextResponse.json({
        success: true,
        message: 'Full caste-koottam configuration updated successfully',
        config: newConfig
      });
    }

    if (!caste || typeof caste !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid caste name is required' },
        { status: 400 }
      );
    }

    const currentList: string[] = config[caste] ? [...config[caste]] : [];

    switch (action) {
      case 'SET_LIST': {
        if (!Array.isArray(koottams)) {
          return NextResponse.json({ success: false, error: 'koottams array is required' }, { status: 400 });
        }
        // Deduplicate and trim
        const cleaned = Array.from(new Set(koottams.map((k: string) => k.trim()).filter(Boolean)));
        config[caste] = cleaned;
        saveConfig(config);
        return NextResponse.json({ success: true, caste, koottams: cleaned });
      }

      case 'ADD_KOOTTAM': {
        const item = (koottam || '').trim();
        if (!item) {
          return NextResponse.json({ success: false, error: 'Koottam name cannot be empty' }, { status: 400 });
        }
        if (!currentList.includes(item)) {
          currentList.push(item);
        }
        config[caste] = currentList;
        saveConfig(config);
        return NextResponse.json({ success: true, caste, koottams: currentList });
      }

      case 'DELETE_KOOTTAM': {
        const item = (koottam || '').trim();
        const filtered = currentList.filter((k) => k !== item);
        config[caste] = filtered;
        saveConfig(config);
        return NextResponse.json({ success: true, caste, koottams: filtered });
      }

      case 'RESET_CASTE': {
        const defaultList = DEFAULT_CASTE_KOOTTAM_MAP[caste] || [];
        config[caste] = [...defaultList];
        saveConfig(config);
        return NextResponse.json({ success: true, caste, koottams: config[caste] });
      }

      case 'BULK_ADD': {
        if (!Array.isArray(koottams)) {
          return NextResponse.json({ success: false, error: 'koottams array is required' }, { status: 400 });
        }
        for (const k of koottams) {
          const item = (k || '').trim();
          if (item && !currentList.includes(item)) {
            currentList.push(item);
          }
        }
        config[caste] = currentList;
        saveConfig(config);
        return NextResponse.json({ success: true, caste, koottams: currentList });
      }

      default: {
        // Fallback: If `koottams` array is supplied, replace list for that caste
        if (Array.isArray(koottams)) {
          const cleaned = Array.from(new Set(koottams.map((k: string) => k.trim()).filter(Boolean)));
          config[caste] = cleaned;
          saveConfig(config);
          return NextResponse.json({ success: true, caste, koottams: cleaned });
        }
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
      }
    }
  } catch (err: any) {
    console.error('POST /api/admin/caste-koottam error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
