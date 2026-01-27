'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Dynamic import for QR scanner (client-side only)
const QrScanner = dynamic(() => import('@/components/qr-scanner').then(mod => mod.QrScanner), {
  ssr: false,
  loading: () => <div className="h-12 bg-muted animate-pulse" />,
});

interface Session {
  id: string;
  title: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface CheckInResult {
  success: boolean;
  type: 'cardholder' | 'guest_list';
  guestName: string;
  cardNumber?: number;
  allocatedBy?: string;
  message: string;
}

export default function AdminCheckInPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState('');
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        // Filter to only today's sessions
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = data.filter((s: Session) => s.date === today);
        setSessions(todaySessions);

        // Auto-select if only one session today
        if (todaySessions.length === 1) {
          setSelectedSession(todaySessions[0].id);
        }
      }
    }

    fetchSessions();
  }, []);

  const performCheckIn = useCallback(async (checkInCode: string) => {
    if (!selectedSession) {
      setError('Bitte wähle eine Session aus');
      return;
    }

    if (!checkInCode.trim()) {
      setError('Bitte gib einen Code oder Kartennummer ein');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession,
          code: checkInCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Check-in fehlgeschlagen');
      } else {
        setResult(data);
        setRecentCheckIns(prev => [data, ...prev.slice(0, 9)]);
        setCode('');
      }
    } catch {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    await performCheckIn(code);
  }

  function handleQrScan(scannedCode: string) {
    // Auto-submit when QR code is scanned
    performCheckIn(scannedCode);
  }

  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Check-in</h1>
        <p className="text-xs text-muted-foreground">Gäste einchecken via Kartennummer oder QR-Code</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">Keine Sessions für heute geplant</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session auswählen</CardTitle>
              <CardDescription>Wähle die heutige Session für den Check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  setResult(null);
                  setError('');
                }}
                className="w-full h-8 px-2 text-xs border bg-background"
              >
                <option value="">Session wählen...</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} - {session.artistName} ({session.startTime} - {session.endTime})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {selectedSessionData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Check-in Scanner</CardTitle>
                <CardDescription>
                  {selectedSessionData.title} • {selectedSessionData.artistName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* QR Scanner */}
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium mb-3">QR-Code scannen</p>
                    <QrScanner
                      onScan={handleQrScan}
                      onError={(err) => setError(err)}
                    />
                  </div>

                  {/* Manual Input */}
                  <form onSubmit={handleCheckIn} className="space-y-4">
                    <p className="text-sm font-medium">Oder manuell eingeben</p>
                    <div className="flex gap-2">
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Kartennummer (1-100) oder Code"
                        className="flex-1 text-lg h-12"
                      />
                      <Button type="submit" disabled={loading} className="h-12 px-8">
                        {loading ? 'Prüfe...' : 'Check-in'}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Gib die Black Card Nummer (z.B. &quot;42&quot;) oder den GL-Ticket Code ein
                    </p>
                  </form>
                </div>

                {error && (
                  <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 text-destructive">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="mt-4 p-4 border border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={result.type === 'cardholder' ? 'default' : 'secondary'}>
                        {result.type === 'cardholder' ? 'Karteninhaber' : 'Gästeliste'}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium">{result.message}</p>
                    {result.cardNumber && (
                      <p className="text-sm mt-1">Karte #{result.cardNumber}</p>
                    )}
                    {result.allocatedBy && (
                      <p className="text-sm mt-1">Eingeladen von: {result.allocatedBy}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {recentCheckIns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Letzte Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentCheckIns.map((checkIn, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={checkIn.type === 'cardholder' ? 'default' : 'secondary'} className="text-[10px]">
                          {checkIn.type === 'cardholder' ? 'Karte' : 'GL'}
                        </Badge>
                        <span className="font-medium">{checkIn.guestName}</span>
                      </div>
                      {checkIn.cardNumber && (
                        <span className="text-muted-foreground">#{checkIn.cardNumber}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
