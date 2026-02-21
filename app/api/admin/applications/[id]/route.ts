import { NextRequest, NextResponse } from 'next/server';
import { db, recordingApplications } from '@/db';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { sendApplicationRejection } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !['new', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    if (status !== 'rejected') {
      updateData.rejectionReason = null;
    }

    const [updated] = await db
      .update(recordingApplications)
      .set(updateData)
      .where(eq(recordingApplications.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (status === 'rejected') {
      sendApplicationRejection({
        to: updated.email,
        artistName: updated.artistName,
        rejectionReason: updated.rejectionReason || undefined,
      }).catch((err) => console.error('Failed to send rejection email:', err));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
