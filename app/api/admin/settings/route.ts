import { NextRequest, NextResponse } from 'next/server';
import { db, siteSettings } from '@/db';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { getAllSettings } from '@/lib/settings';
import { getDefinition, getDefaultValue } from '@/lib/settings-defaults';

// GET /api/admin/settings - Get all settings (defaults + overrides)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/admin/settings - Bulk upsert settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const entries = Object.entries(body) as [string, string][];
    const errors: string[] = [];

    for (const [key, value] of entries) {
      const def = getDefinition(key);
      if (!def) {
        errors.push(`Unknown setting key: ${key}`);
        continue;
      }
      if (typeof value !== 'string') {
        errors.push(`Value for ${key} must be a string`);
        continue;
      }
      if (value.length > def.maxLength) {
        errors.push(`${def.label} exceeds max length of ${def.maxLength}`);
        continue;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const userId = session.user.id;

    // Process each setting: upsert or delete if value matches default
    for (const [key, value] of entries) {
      const defaultVal = getDefaultValue(key);

      if (value === defaultVal) {
        // Delete override - fall back to default
        await db.delete(siteSettings).where(eq(siteSettings.key, key));
      } else {
        // Upsert
        await db
          .insert(siteSettings)
          .values({ key, value, updatedBy: userId, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value, updatedBy: userId, updatedAt: new Date() },
          });
      }
    }

    // Return all settings after update
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
