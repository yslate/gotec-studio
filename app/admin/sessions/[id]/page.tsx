import { notFound } from 'next/navigation';
import { db, recordingSessions } from '@/db';
import { eq } from 'drizzle-orm';
import { SessionForm } from '@/components/admin/session-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSession(id: string) {
  const session = await db
    .select()
    .from(recordingSessions)
    .where(eq(recordingSessions.id, id))
    .limit(1);

  return session[0] || null;
}

export default async function EditSessionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) {
    notFound();
  }

  // Format time from "HH:MM:SS" to "HH:MM" for form input
  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className="max-w-2xl">
      <SessionForm
        mode="edit"
        initialData={{
          id: session.id,
          title: session.title,
          artistName: session.artistName,
          date: session.date,
          startTime: formatTime(session.startTime),
          endTime: formatTime(session.endTime),
          maxCardholders: session.maxCardholders,
          maxWaitlist: session.maxWaitlist,
          maxGuestList: session.maxGuestList,
          description: session.description,
          isPublished: session.isPublished,
        }}
      />
    </div>
  );
}
