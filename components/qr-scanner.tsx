'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';

interface QrScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  async function startScanning() {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText);
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
        },
        () => {
          // QR code not found in frame - ignore
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setHasPermission(false);
      onError?.('Kamera-Zugriff verweigert oder nicht verfügbar');
    }
  }

  async function stopScanning() {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className={`relative overflow-hidden bg-black/5 ${isScanning ? 'aspect-square max-w-[300px] mx-auto' : 'h-0'}`}
      />

      {hasPermission === false && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20">
          Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.
        </div>
      )}

      <Button
        type="button"
        variant={isScanning ? 'destructive' : 'outline'}
        onClick={isScanning ? stopScanning : startScanning}
        className="w-full"
      >
        {isScanning ? (
          <>
            <CameraOffIcon className="w-4 h-4 mr-2" />
            Scanner stoppen
          </>
        ) : (
          <>
            <CameraIcon className="w-4 h-4 mr-2" />
            QR-Scanner starten
          </>
        )}
      </Button>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}
