'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSettings } from '@/lib/use-settings';

export function Footer() {
  const s = useSettings(['footer.copyright', 'footer.imprintLabel', 'footer.privacyLabel']);
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <footer ref={footerRef} className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-foreground/50">
          <p>&copy; {new Date().getFullYear()} {s['footer.copyright']}</p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-foreground transition-colors">
              {s['footer.imprintLabel']}
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">
              {s['footer.privacyLabel']}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
