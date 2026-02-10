'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface Application {
  id: string;
  email: string;
  artistName: string;
  genre: string;
  artistOrigin: string;
  instagramUrl: string | null;
  soundcloudUrl: string | null;
  message: string;
  slotId: string | null;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
  slotDate: string | null;
  slotStartTime: string | null;
  slotEndTime: string | null;
  slotStatus: string | null;
}

interface AvailableSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

const statusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  reviewed: 'secondary',
  accepted: 'outline',
  rejected: 'destructive',
};

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);

  // Accept dialog state
  const [showAccept, setShowAccept] = useState(false);
  const [acceptTitle, setAcceptTitle] = useState('');
  const [acceptDesc, setAcceptDesc] = useState('');
  const [acceptMaxCard, setAcceptMaxCard] = useState(15);
  const [acceptMaxWait, setAcceptMaxWait] = useState(5);
  const [acceptMaxGL, setAcceptMaxGL] = useState(10);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptStart, setAcceptStart] = useState('14:00');
  const [acceptEnd, setAcceptEnd] = useState('18:00');
  const [accepting, setAccepting] = useState(false);

  // Reject dialog state
  const [showReject, setShowReject] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Reassign dialog state
  const [showReassign, setShowReassign] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [reassignSlotId, setReassignSlotId] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    const res = await fetch('/api/admin/applications');
    if (res.ok) {
      const data = await res.json();
      setApplications(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchApplications();
      if (selected?.id === id) {
        const updated = await res.json();
        setSelected(updated);
      }
    }
  }

  function openAcceptDialog() {
    if (!selected) return;
    setAcceptTitle(`${selected.artistName} Session`);
    setAcceptDesc('');
    setAcceptMaxCard(15);
    setAcceptMaxWait(5);
    setAcceptMaxGL(10);
    setAcceptDate(selected.slotDate || '');
    setAcceptStart(selected.slotStartTime ? selected.slotStartTime.slice(0, 5) : '14:00');
    setAcceptEnd(selected.slotEndTime ? selected.slotEndTime.slice(0, 5) : '18:00');
    setShowAccept(true);
  }

  async function handleAccept() {
    if (!selected) return;
    setAccepting(true);

    const payload: Record<string, unknown> = {
      status: 'accepted',
      title: acceptTitle,
      description: acceptDesc || undefined,
      maxCardholders: acceptMaxCard,
      maxWaitlist: acceptMaxWait,
      maxGuestList: acceptMaxGL,
    };

    // If no slot assigned, send manual date/time
    if (!selected.slotId) {
      payload.date = acceptDate;
      payload.startTime = acceptStart;
      payload.endTime = acceptEnd;
    }

    const res = await fetch(`/api/admin/applications/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowAccept(false);
      fetchApplications();
      setSelected(null);
    }
    setAccepting(false);
  }

  async function handleReject() {
    if (!selected) return;
    setRejecting(true);

    const res = await fetch(`/api/admin/applications/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });

    if (res.ok) {
      setShowReject(false);
      fetchApplications();
      setSelected(null);
    }
    setRejecting(false);
  }

  async function openReassignDialog() {
    setShowReassign(true);
    setReassignSlotId(null);
    const res = await fetch('/api/slots');
    if (res.ok) {
      setAvailableSlots(await res.json());
    }
  }

  async function handleReassign() {
    if (!selected || !reassignSlotId) return;
    setReassigning(true);

    const res = await fetch(`/api/admin/applications/${selected.id}/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: reassignSlotId }),
    });

    if (res.ok) {
      setShowReassign(false);
      fetchApplications();
      const updated = await res.json();
      setSelected(updated);
    }
    setReassigning(false);
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Applications</h1>
        <div className="flex gap-1 flex-wrap">
          {['all', 'new', 'reviewed', 'accepted', 'rejected'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusLabels[f]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed">
          <p className="text-sm text-muted-foreground">No applications</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 space-y-1 min-w-0">
            {filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className={`w-full text-left p-3 border text-sm transition-colors ${
                  selected?.id === app.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium truncate">{app.artistName}</span>
                  <Badge variant={statusVariants[app.status]} className="text-[10px] shrink-0">
                    {statusLabels[app.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {app.genre} &middot; {app.artistOrigin}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {app.slotDate && (
                    <span className="text-[10px] text-primary">
                      Slot: {formatDate(app.slotDate)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="w-[400px] border p-4 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm">{selected.artistName}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelected(null)}
                >
                  &times;
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">E-Mail: </span>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Genre: </span>
                  <span>{selected.genre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Origin: </span>
                  <span>{selected.artistOrigin}</span>
                </div>
                {selected.instagramUrl && (
                  <div>
                    <span className="text-muted-foreground">Instagram: </span>
                    <a
                      href={selected.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selected.instagramUrl}
                    </a>
                  </div>
                )}
                {selected.soundcloudUrl && (
                  <div>
                    <span className="text-muted-foreground">SoundCloud: </span>
                    <a
                      href={selected.soundcloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selected.soundcloudUrl}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span>
                    {new Date(selected.createdAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Slot Info */}
                <div className="border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Recording Slot: </span>
                  {selected.slotDate ? (
                    <span>
                      {formatDate(selected.slotDate)}, {formatTime(selected.slotStartTime!)}{' '}
                      – {formatTime(selected.slotEndTime!)}
                      {selected.slotStatus === 'booked' && (
                        <Badge variant="secondary" className="text-[10px] ml-2">Booked</Badge>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No slot</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Message:</p>
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="border-t pt-4 flex flex-wrap gap-2">
                {selected.status === 'new' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'reviewed')}
                  >
                    Mark as reviewed
                  </Button>
                )}
                {selected.status !== 'accepted' && selected.status !== 'rejected' && (
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={openAcceptDialog}
                  >
                    Accept
                  </Button>
                )}
                {selected.status !== 'rejected' && selected.status !== 'accepted' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                    onClick={() => setShowReject(true)}
                  >
                    Reject
                  </Button>
                )}
                {!selected.slotId && selected.status !== 'accepted' && selected.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={openReassignDialog}
                  >
                    Assign Slot
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accept Dialog */}
      <Dialog open={showAccept} onOpenChange={setShowAccept}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>
              A recording session will be created and an email sent to {selected?.artistName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selected?.slotDate ? (
              <div className="text-xs text-muted-foreground border p-3 bg-muted/30">
                <span className="font-medium text-foreground">Slot: </span>
                {formatDate(selected.slotDate)}, {formatTime(selected.slotStartTime!)}{' '}
                – {formatTime(selected.slotEndTime!)}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">No slot assigned — enter date and time manually:</p>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Date *</label>
                  <Input type="date" value={acceptDate} onChange={(e) => setAcceptDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Start Time *</label>
                    <Input type="time" value={acceptStart} onChange={(e) => setAcceptStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">End Time *</label>
                    <Input type="time" value={acceptEnd} onChange={(e) => setAcceptEnd(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Session Title *</label>
              <Input value={acceptTitle} onChange={(e) => setAcceptTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea
                value={acceptDesc}
                onChange={(e) => setAcceptDesc(e.target.value)}
                rows={2}
                className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Max Cardholders</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={acceptMaxCard}
                  onChange={(e) => setAcceptMaxCard(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Max Waitlist</label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={acceptMaxWait}
                  onChange={(e) => setAcceptMaxWait(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Max Guest List</label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={acceptMaxGL}
                  onChange={(e) => setAcceptMaxGL(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccept(false)}>Cancel</Button>
            <Button onClick={handleAccept} disabled={accepting || !acceptTitle || (!selected?.slotId && !acceptDate)}>
              {accepting ? 'Creating...' : 'Create Session & Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              A rejection email will be sent to {selected?.artistName} ({selected?.email}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? 'Rejecting...' : 'Reject & Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Slot Dialog */}
      <Dialog open={showReassign} onOpenChange={setShowReassign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Slot</DialogTitle>
            <DialogDescription>
              Choose an available slot for {selected?.artistName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available slots
              </p>
            ) : (
              availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setReassignSlotId(slot.id)}
                  className={`w-full text-left p-3 border text-sm transition-colors ${
                    reassignSlotId === slot.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="font-medium">{formatDate(slot.date)}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassign(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={reassigning || !reassignSlotId}>
              {reassigning ? 'Assigning...' : 'Assign Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
