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
} from '@/components/ui/dialog';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  createdAt: string;
  applicationCount: number;
}

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('14:00');
  const [formEnd, setFormEnd] = useState('18:00');

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoading(true);
    const res = await fetch('/api/admin/slots');
    if (res.ok) {
      setSlots(await res.json());
    }
    setLoading(false);
  }

  async function handleCreate() {
    setSaving(true);
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: formDate, startTime: formStart, endTime: formEnd }),
    });
    if (res.ok) {
      setShowCreate(false);
      resetForm();
      fetchSlots();
    }
    setSaving(false);
  }

  async function handleUpdate() {
    if (!editSlot) return;
    setSaving(true);
    const res = await fetch(`/api/admin/slots/${editSlot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: formDate, startTime: formStart, endTime: formEnd }),
    });
    if (res.ok) {
      setEditSlot(null);
      resetForm();
      fetchSlots();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    const res = await fetch(`/api/admin/slots/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchSlots();
    }
  }

  function resetForm() {
    setFormDate('');
    setFormStart('14:00');
    setFormEnd('18:00');
  }

  function openEdit(slot: Slot) {
    setFormDate(slot.date);
    setFormStart(slot.startTime.slice(0, 5));
    setFormEnd(slot.endTime.slice(0, 5));
    setEditSlot(slot);
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
  }

  const filtered = filter === 'all'
    ? slots
    : slots.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-lg font-medium">Recording Slots</h1>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {['all', 'available', 'booked'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'available' ? 'Available' : 'Booked'}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => { resetForm(); setShowCreate(true); }}
          >
            + New Slot
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed">
          <p className="text-sm text-muted-foreground">No slots available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Time Slot</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Applications</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((slot) => (
                <tr key={slot.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{formatDate(slot.date)}</td>
                  <td className="py-3 pr-4">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={slot.status === 'available' ? 'outline' : 'secondary'}>
                      {slot.status === 'available' ? 'Available' : 'Booked'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4">{slot.applicationCount}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {slot.status === 'available' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => openEdit(slot)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive"
                            onClick={() => handleDelete(slot.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Date</label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
                <Input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">End Time</label>
                <Input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !formDate}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editSlot} onOpenChange={(open) => !open && setEditSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Date</label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
                <Input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">End Time</label>
                <Input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlot(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving || !formDate}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
