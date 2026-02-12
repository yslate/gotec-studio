/**
 * CSV export utilities for admin data.
 */

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface BookingRow {
  guestName: string;
  guestPhone?: string;
  cardNumber: number;
  sessionTitle: string;
  sessionDate: string;
  status: string;
  createdAt: string;
}

export function exportBookingsCSV(bookings: BookingRow[], filename = 'bookings.csv') {
  const headers = ['Guest Name', 'Phone', 'Card #', 'Session', 'Date', 'Status', 'Created'];
  const rows = bookings.map(b => [
    escapeCSV(b.guestName),
    escapeCSV(b.guestPhone),
    escapeCSV(b.cardNumber),
    escapeCSV(b.sessionTitle),
    escapeCSV(b.sessionDate),
    escapeCSV(b.status),
    escapeCSV(b.createdAt),
  ].join(','));

  downloadCSV([headers.join(','), ...rows].join('\n'), filename);
}

interface GuestListRow {
  guestName: string;
  guestEmail?: string;
  code: string;
  status: string;
  allocatedBy?: string;
}

export function exportGuestListCSV(tickets: GuestListRow[], sessionTitle: string, filename = 'guest-list.csv') {
  const headers = ['Guest Name', 'Email', 'Ticket Code', 'Status', 'Allocated By'];
  const rows = tickets.map(t => [
    escapeCSV(t.guestName),
    escapeCSV(t.guestEmail),
    escapeCSV(t.code),
    escapeCSV(t.status),
    escapeCSV(t.allocatedBy),
  ].join(','));

  downloadCSV(
    [headers.join(','), ...rows].join('\n'),
    filename || `guest-list-${sessionTitle.replace(/\s+/g, '-').toLowerCase()}.csv`
  );
}
