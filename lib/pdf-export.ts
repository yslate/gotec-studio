import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body: string[][];
      startY?: number;
      theme?: 'striped' | 'grid' | 'plain';
      headStyles?: { fillColor?: number[]; textColor?: number[] };
      styles?: { fontSize?: number; cellPadding?: number };
      columnStyles?: Record<number, { cellWidth?: number | 'auto' }>;
    }) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

interface SessionInfo {
  title: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingEntry {
  guestName: string;
  cardNumber: number;
  status: string;
  phone?: string;
}

interface GuestListEntry {
  guestName: string;
  code: string;
  status: string;
  allocatedBy?: string;
}

export function generateCheckInListPDF(
  session: SessionInfo,
  bookings: BookingEntry[],
  guestList: GuestListEntry[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GOTEC DJ-Studio', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Check-in Liste', pageWidth / 2, 28, { align: 'center' });

  // Session info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(session.title, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Artist: ${session.artistName}`, 14, 49);
  doc.text(
    `Datum: ${new Date(session.date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
    14,
    55
  );
  doc.text(`Zeit: ${session.startTime} - ${session.endTime} Uhr`, 14, 61);

  // Stats
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const waitlistCount = bookings.filter(b => b.status === 'waitlist').length;
  const glCount = guestList.filter(g => g.status === 'valid').length;

  doc.setFont('helvetica', 'bold');
  doc.text(
    `Bestätigt: ${confirmedCount} | Warteliste: ${waitlistCount} | Gästeliste: ${glCount}`,
    14,
    70
  );

  // Cardholders table
  let yPosition = 80;

  if (bookings.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Black Card Buchungen', 14, yPosition);
    yPosition += 6;

    const bookingRows = bookings.map(b => [
      `#${b.cardNumber}`,
      b.guestName,
      b.phone || '-',
      b.status === 'confirmed' ? 'Bestätigt' :
      b.status === 'waitlist' ? 'Warteliste' :
      b.status === 'checked_in' ? 'Eingecheckt' : b.status,
      '' // Checkbox column
    ]);

    doc.autoTable({
      head: [['Karte', 'Name', 'Telefon', 'Status', 'Check-in']],
      body: bookingRows,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [110, 41, 49], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        4: { cellWidth: 25 }
      }
    });

    yPosition = (doc.lastAutoTable?.finalY || yPosition) + 10;
  }

  // Guest list table
  if (guestList.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Gästeliste', 14, yPosition);
    yPosition += 6;

    const glRows = guestList.map(g => [
      g.code,
      g.guestName || '-',
      g.allocatedBy || '-',
      g.status === 'valid' ? 'Gültig' :
      g.status === 'used' ? 'Verwendet' : g.status,
      '' // Checkbox column
    ]);

    doc.autoTable({
      head: [['Code', 'Name', 'Eingeladen von', 'Status', 'Check-in']],
      body: glRows,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [110, 41, 49], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Erstellt am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Seite ${i} von ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Generate filename
  const dateStr = session.date.replace(/-/g, '');
  const filename = `CheckIn_${dateStr}_${session.title.replace(/\s+/g, '_')}.pdf`;

  // Download
  doc.save(filename);
}
