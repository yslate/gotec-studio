'use client';

import { QRCodeSVG } from 'qrcode.react';

interface TicketQRProps {
  code: string;
  size?: number;
}

export function TicketQR({ code, size = 200 }: TicketQRProps) {
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gl/${code}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-4 bg-white rounded">
        <QRCodeSVG
          value={ticketUrl}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-muted-foreground">Scanne den QR-Code am Eingang</p>
    </div>
  );
}
