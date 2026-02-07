'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/bookings', label: 'Buchungen' },
  { href: '/admin/cards', label: 'Black Cards' },
  { href: '/admin/gl-tickets', label: 'Gästeliste' },
  { href: '/admin/check-in', label: 'Check-in' },
  { href: '/admin/inquiries', label: 'Anfragen' },
  { href: '/admin/applications', label: 'Bewerbungen' },
];

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = '/login';
  }

  const sidebarContent = (
    <>
      <Link href="/admin" className="block p-5 border-b hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(false)}>
        <Image
          src="/LogoGotecRecords.png"
          alt="GOTEC Records"
          width={160}
          height={55}
          className="h-7 w-auto"
        />
      </Link>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'block px-3 py-2.5 text-sm transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={handleSignOut}
        >
          Abmelden
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-3">
          <Link href="/admin">
            <Image
              src="/LogoGotecRecords.png"
              alt="GOTEC Records"
              width={120}
              height={40}
              className="h-6 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-background z-50 flex flex-col transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 border-r min-h-screen flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
