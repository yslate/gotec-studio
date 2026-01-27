import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db, guestListTickets, recordingSessions } from '@/db';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketQR } from '@/components/booking/ticket-qr';

interface PageProps {
  params: Promise<{ code: string }>;
}

async function getTicket(code: string) {
  const ticket = await db
    .select({
      id: guestListTickets.id,
      code: guestListTickets.code,
      guestName: guestListTickets.guestName,
      status: guestListTickets.status,
      allocatedBy: guestListTickets.allocatedBy,
      usedAt: guestListTickets.usedAt,
      session: {
        title: recordingSessions.title,
        artistName: recordingSessions.artistName,
        date: recordingSessions.date,
        startTime: recordingSessions.startTime,
        endTime: recordingSessions.endTime,
      },
    })
    .from(guestListTickets)
    .innerJoin(recordingSessions, eq(guestListTickets.sessionId, recordingSessions.id))
    .where(eq(guestListTickets.code, code))
    .limit(1);

  return ticket[0] || null;
}

export default async function GLTicketPage({ params }: PageProps) {
  const { code } = await params;
  const ticket = await getTicket(code);

  if (!ticket) {
    notFound();
  }

  const sessionDate = new Date(ticket.session.date);
  const formattedDate = sessionDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isUsed = ticket.status === 'used';
  const isExpired = ticket.status === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image
            src="/LogoGotecRecords.png"
            alt="GOTEC Records"
            width={140}
            height={50}
            className="h-10 w-auto mx-auto mb-2"
          />
          <div className="mb-2">
            {isUsed ? (
              <Badge variant="secondary" className="text-sm">Verwendet</Badge>
            ) : isExpired ? (
              <Badge variant="destructive" className="text-sm">Abgelaufen</Badge>
            ) : (
              <Badge className="text-sm">Gültig</Badge>
            )}
          </div>
          <CardTitle className="text-xl">Gästeliste Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isUsed && !isExpired && (
            <div className="flex justify-center">
              <TicketQR code={ticket.code} size={180} />
            </div>
          )}

          <div className="text-center p-4 border-2 border-dashed">
            <p className="text-2xl font-bold tracking-wider">{ticket.code}</p>
            <p className="text-xs text-muted-foreground mt-1">Zeige diesen Code am Eingang</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gast:</span>
              <span className="font-medium">{ticket.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session:</span>
              <span className="font-medium">{ticket.session.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Artist:</span>
              <span className="font-medium">{ticket.session.artistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Datum:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uhrzeit:</span>
              <span className="font-medium">{ticket.session.startTime} - {ticket.session.endTime}</span>
            </div>
            {ticket.allocatedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eingeladen von:</span>
                <span className="font-medium">{ticket.allocatedBy}</span>
              </div>
            )}
          </div>

          {isUsed && ticket.usedAt && (
            <div className="text-center text-xs text-muted-foreground border-t pt-4">
              Verwendet am {new Date(ticket.usedAt).toLocaleString('de-DE')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
