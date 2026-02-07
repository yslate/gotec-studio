import { NextResponse } from 'next/server';
import { db, recordingApplications } from '@/db';
import { desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await db
      .select()
      .from(recordingApplications)
      .orderBy(desc(recordingApplications.createdAt));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
