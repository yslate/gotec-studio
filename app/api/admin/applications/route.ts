import { NextResponse } from 'next/server';
import { db, recordingApplications, recordingSlots } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await db
      .select({
        id: recordingApplications.id,
        email: recordingApplications.email,
        artistName: recordingApplications.artistName,
        genre: recordingApplications.genre,
        artistOrigin: recordingApplications.artistOrigin,
        instagramUrl: recordingApplications.instagramUrl,
        soundcloudUrl: recordingApplications.soundcloudUrl,
        message: recordingApplications.message,
        slotId: recordingApplications.slotId,
        status: recordingApplications.status,
        createdAt: recordingApplications.createdAt,
        slotDate: recordingSlots.date,
        slotStartTime: recordingSlots.startTime,
        slotEndTime: recordingSlots.endTime,
        slotStatus: recordingSlots.status,
      })
      .from(recordingApplications)
      .leftJoin(recordingSlots, eq(recordingApplications.slotId, recordingSlots.id))
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
