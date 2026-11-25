import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSupabaseStorageUrl } from '@/backend/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
    }

    // 1. Handle Inline Base64 Data URLs
    if (targetUrl.startsWith('data:')) {
      const commaIdx = targetUrl.indexOf(',');
      const meta = targetUrl.substring(5, commaIdx);
      const isBase64 = meta.includes(';base64');
      const contentType = meta.split(';')[0] || 'application/octet-stream';
      const rawData = targetUrl.substring(commaIdx + 1);
      const buffer = isBase64 ? Buffer.from(rawData, 'base64') : Buffer.from(decodeURIComponent(rawData));
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // 2. Parse Supabase Storage Bucket & Path
    const parsed = parseSupabaseStorageUrl(targetUrl);
    if (!parsed) {
      // External URL - redirect directly
      return NextResponse.redirect(targetUrl);
    }

    // 3. Download directly from Supabase Storage (bypasses private bucket public URL blocks)
    const { data: fileBlob, error } = await supabase.storage
      .from(parsed.bucket)
      .download(parsed.path);

    if (error || !fileBlob) {
      // Fallback: try createSignedUrl
      const { data: signed } = await supabase.storage
        .from(parsed.bucket)
        .createSignedUrl(parsed.path, 3600);
      if (signed?.signedUrl) {
        return NextResponse.redirect(signed.signedUrl);
      }
      return NextResponse.json({ error: error?.message || 'File not found' }, { status: 404 });
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = fileBlob.type || (parsed.path.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err: any) {
    console.error('API /api/storage/document error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
