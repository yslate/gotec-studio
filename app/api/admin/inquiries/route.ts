import { NextResponse } from 'next/server';
import { db, contactInquiries } from '@/db';
import { desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await db
      .select()
      .from(contactInquiries)
      .orderBy(desc(contactInquiries.createdAt));

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
