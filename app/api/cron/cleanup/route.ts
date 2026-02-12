import { NextRequest, NextResponse } from 'next/server';
import { db, emailVerificationCodes } from '@/db';
import { lt, sql } from 'drizzle-orm';

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/cleanup - Clean up expired verification codes
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete verification codes that expired more than 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const deleted = await db
      .delete(emailVerificationCodes)
      .where(lt(emailVerificationCodes.expiresAt, oneHourAgo))
      .returning({ id: emailVerificationCodes.id });

    return NextResponse.json({
      success: true,
      cleaned: {
        expiredVerificationCodes: deleted.length,
      },
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
