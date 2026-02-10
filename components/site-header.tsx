'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/use-settings';

const navLinkDefs = [
  { href: '/sessions', settingKey: 'nav.sessions' },
  { href: '/library', settingKey: null, defaultLabel: 'Library' },
  { href: '/blackcard', settingKey: 'nav.blackcard' },
  { href: '/apply', settingKey: 'nav.apply' },
  { href: '/contact', settingKey: 'nav.contact' },
];

interface SiteHeaderProps {
  heroMode?: boolean;
}

export function SiteHeader({ heroMode = false }: SiteHeaderProps) {
  const s = useSettings(['nav.sessions', 'nav.blackcard', 'nav.apply', 'nav.contact']);
  const navLinks = navLinkDefs.map((def) => ({
    href: def.href,
    label: def.settingKey ? s[def.settingKey] : def.defaultLabel!,
  }));
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!heroMode) return;

    function onScroll() {
      setScrolled(window.scrollY > 80);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroMode]);

  const isTransparent = heroMode && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border'
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={cn(
              'transition-all duration-300',
              isTransparent ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'
            )}
          >
            <Image
              src="/LogoGotecRecords.png"
              alt="GOTEC Records"
              width={140}
              height={50}
              className="h-8 sm:h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs uppercase tracking-wider transition-colors',
                  pathname === link.href
                    ? isTransparent ? 'text-white' : 'text-foreground'
                    : isTransparent ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'sm:hidden p-1 transition-colors',
              isTransparent ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="sm:hidden pt-4 pb-2 border-t mt-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'text-xs uppercase tracking-wider transition-colors py-1',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
