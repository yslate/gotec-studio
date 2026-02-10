import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

// GET /api/settings?keys=key1,key2,key3 - Public endpoint for client components
export async function GET(request: NextRequest) {
  try {
    const keysParam = request.nextUrl.searchParams.get('keys');
    if (!keysParam) {
      return NextResponse.json({ error: 'Missing keys parameter' }, { status: 400 });
    }

    const keys = keysParam.split(',').filter(Boolean);
    if (keys.length === 0) {
      return NextResponse.json({});
    }

    // Limit to 50 keys per request to prevent abuse
    if (keys.length > 50) {
      return NextResponse.json({ error: 'Too many keys (max 50)' }, { status: 400 });
    }

    const settings = await getSettings(keys);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
