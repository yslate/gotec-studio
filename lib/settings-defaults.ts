export interface SettingDefinition {
  key: string;
  defaultValue: string;
  maxLength: number;
  label: string;
  category: 'page-content';
  group: string;
  type: 'short' | 'long' | 'select';
  options?: { value: string; label: string }[];
}

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  // ─── Homepage ───────────────────────────────────────────
  {
    key: 'homepage.hero.backgroundType',
    defaultValue: 'video',
    label: 'Hero Background',
    maxLength: 10,
    category: 'page-content',
    group: 'Homepage',
    type: 'select',
    options: [
      { value: 'video', label: 'YouTube Video (Latest)' },
      { value: 'image', label: 'Custom Image' },
    ],
  },
  {
    key: 'homepage.hero.imageUrl',
    defaultValue: '',
    label: 'Hero Image URL',
    maxLength: 500,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.hero.tagline',
    defaultValue: 'DJ Recording Studio \u2014 Karlsruhe',
    label: 'Hero Tagline',
    maxLength: 80,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.hero.cta',
    defaultValue: 'View Sessions',
    label: 'Hero Button Text',
    maxLength: 40,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.about.title',
    defaultValue: 'About',
    label: 'About Section Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.about.text1',
    defaultValue: 'Gotec Records is a professional DJ recording studio based in Karlsruhe, Germany. We specialize in capturing raw, unfiltered DJ sessions across various genres of electronic music \u2014 from hard techno and industrial to melodic techno and minimal.',
    label: 'About Paragraph 1',
    maxLength: 400,
    category: 'page-content',
    group: 'Homepage',
    type: 'long',
  },
  {
    key: 'homepage.about.text2',
    defaultValue: 'Our studio is built for artists who want to record their sound in a professional environment and become part of our curated output. Every session is captured with precision, delivering the energy of a live performance.',
    label: 'About Paragraph 2',
    maxLength: 400,
    category: 'page-content',
    group: 'Homepage',
    type: 'long',
  },
  {
    key: 'homepage.blackcard.title',
    defaultValue: 'The Black Card',
    label: 'Black Card Section Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.blackcard.text',
    defaultValue: 'You don\u2019t ask for it. You earn it \u2014 by fully vibing with the music at Gotec Club. When your energy stands out, someone will notice and hand you the Black Card.',
    label: 'Black Card Section Text',
    maxLength: 300,
    category: 'page-content',
    group: 'Homepage',
    type: 'long',
  },
  {
    key: 'homepage.blackcard.cta',
    defaultValue: 'Learn more',
    label: 'Black Card Button Text',
    maxLength: 40,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.blackcard.stat',
    defaultValue: '100',
    label: 'Cards in Circulation Number',
    maxLength: 10,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.blackcard.statLabel',
    defaultValue: 'Cards in Circulation',
    label: 'Cards in Circulation Label',
    maxLength: 40,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.apply.title',
    defaultValue: 'Recording Slot Application',
    label: 'Apply Section Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.apply.text',
    defaultValue: 'We are opening a limited number of recording slots for DJs with a clear musical identity and a passion for electronic music. Submit your application and become part of our curated output.',
    label: 'Apply Section Text',
    maxLength: 300,
    category: 'page-content',
    group: 'Homepage',
    type: 'long',
  },
  {
    key: 'homepage.apply.cta',
    defaultValue: 'Apply now',
    label: 'Apply Button Text',
    maxLength: 40,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.contact.title',
    defaultValue: 'Questions?',
    label: 'Contact Section Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Homepage',
    type: 'short',
  },
  {
    key: 'homepage.contact.text',
    defaultValue: 'Get in touch for collaborations, feedback, or general inquiries.',
    label: 'Contact Section Text',
    maxLength: 200,
    category: 'page-content',
    group: 'Homepage',
    type: 'long',
  },

  // ─── Black Card Page ────────────────────────────────────
  {
    key: 'blackcard.title',
    defaultValue: 'The Black Card',
    label: 'Page Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Black Card',
    type: 'short',
  },
  {
    key: 'blackcard.text1',
    defaultValue: 'You don\u2019t ask for it. You earn it \u2014 by fully vibing with the music at Gotec Club.',
    label: 'Paragraph 1',
    maxLength: 200,
    category: 'page-content',
    group: 'Black Card',
    type: 'long',
  },
  {
    key: 'blackcard.text2',
    defaultValue: 'When your energy stands out, someone will notice \u2014 and hand you the Black Card.',
    label: 'Paragraph 2',
    maxLength: 200,
    category: 'page-content',
    group: 'Black Card',
    type: 'long',
  },
  {
    key: 'blackcard.text3',
    defaultValue: 'It gives you one-time access to a live session at Gotec Records \u2014 a raw DJ recording, straight from the source.',
    label: 'Paragraph 3',
    maxLength: 200,
    category: 'page-content',
    group: 'Black Card',
    type: 'long',
  },
  {
    key: 'blackcard.text4',
    defaultValue: 'After that, the card goes back to the club \u2014 waiting for the next one who feels the music deep.',
    label: 'Paragraph 4',
    maxLength: 200,
    category: 'page-content',
    group: 'Black Card',
    type: 'long',
  },
  {
    key: 'blackcard.text5',
    defaultValue: 'Use it wisely.',
    label: 'Closing Line',
    maxLength: 60,
    category: 'page-content',
    group: 'Black Card',
    type: 'short',
  },

  // ─── Sessions Page ──────────────────────────────────────
  {
    key: 'sessions.title',
    defaultValue: 'Available Sessions',
    label: 'Page Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Sessions',
    type: 'short',
  },
  {
    key: 'sessions.subtitle',
    defaultValue: 'Choose a recording session and book your spot with your Black Card',
    label: 'Page Subtitle',
    maxLength: 150,
    category: 'page-content',
    group: 'Sessions',
    type: 'long',
  },
  {
    key: 'sessions.empty',
    defaultValue: 'No sessions available at the moment',
    label: 'Empty State Text',
    maxLength: 100,
    category: 'page-content',
    group: 'Sessions',
    type: 'short',
  },
  {
    key: 'sessions.emptyHint',
    defaultValue: 'Check back later!',
    label: 'Empty State Hint',
    maxLength: 60,
    category: 'page-content',
    group: 'Sessions',
    type: 'short',
  },

  // ─── Apply Page ─────────────────────────────────────────
  {
    key: 'apply.title',
    defaultValue: 'Recording Slot Application',
    label: 'Page Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Apply',
    type: 'short',
  },
  {
    key: 'apply.intro1',
    defaultValue: 'Gotec Records Studio is opening a limited number of recording slots for DJs who want to capture their sound in a professional studio environment.',
    label: 'Intro Paragraph 1',
    maxLength: 300,
    category: 'page-content',
    group: 'Apply',
    type: 'long',
  },
  {
    key: 'apply.intro2',
    defaultValue: 'We are looking for DJs with a clear musical identity, a strong selection, and a passion for electronic music. All submissions will be carefully reviewed by our team. Selected artists will be contacted directly.',
    label: 'Intro Paragraph 2',
    maxLength: 400,
    category: 'page-content',
    group: 'Apply',
    type: 'long',
  },
  {
    key: 'apply.successTitle',
    defaultValue: 'Application submitted',
    label: 'Success Title',
    maxLength: 60,
    category: 'page-content',
    group: 'Apply',
    type: 'short',
  },
  {
    key: 'apply.successText',
    defaultValue: 'We will review your application and get back to you if selected.',
    label: 'Success Text',
    maxLength: 150,
    category: 'page-content',
    group: 'Apply',
    type: 'long',
  },

  // ─── Contact Page ───────────────────────────────────────
  {
    key: 'contact.title',
    defaultValue: 'Contact',
    label: 'Page Title',
    maxLength: 40,
    category: 'page-content',
    group: 'Contact',
    type: 'short',
  },
  {
    key: 'contact.intro',
    defaultValue: 'Questions, collaborations, or feedback? Send us a message or write to us directly.',
    label: 'Intro Text',
    maxLength: 200,
    category: 'page-content',
    group: 'Contact',
    type: 'long',
  },
  {
    key: 'contact.successTitle',
    defaultValue: 'Message sent',
    label: 'Success Title',
    maxLength: 40,
    category: 'page-content',
    group: 'Contact',
    type: 'short',
  },
  {
    key: 'contact.successText',
    defaultValue: 'We will get back to you as soon as possible.',
    label: 'Success Text',
    maxLength: 150,
    category: 'page-content',
    group: 'Contact',
    type: 'long',
  },

  // ─── My Bookings Page ──────────────────────────────────
  {
    key: 'mybookings.title',
    defaultValue: 'Retrieve Bookings',
    label: 'Card Title',
    maxLength: 60,
    category: 'page-content',
    group: 'My Bookings',
    type: 'short',
  },
  {
    key: 'mybookings.subtitle',
    defaultValue: 'Enter your email address to view your bookings',
    label: 'Card Subtitle',
    maxLength: 100,
    category: 'page-content',
    group: 'My Bookings',
    type: 'short',
  },
  {
    key: 'mybookings.empty',
    defaultValue: 'No bookings found',
    label: 'Empty State Text',
    maxLength: 60,
    category: 'page-content',
    group: 'My Bookings',
    type: 'short',
  },
  {
    key: 'mybookings.emptyHint',
    defaultValue: 'Check your email address or book a session',
    label: 'Empty State Hint',
    maxLength: 100,
    category: 'page-content',
    group: 'My Bookings',
    type: 'short',
  },

  // ─── Footer ─────────────────────────────────────────────
  {
    key: 'footer.copyright',
    defaultValue: 'GOTEC Records. All rights reserved.',
    label: 'Copyright Text (year is added automatically)',
    maxLength: 100,
    category: 'page-content',
    group: 'Footer',
    type: 'short',
  },
  {
    key: 'footer.imprintLabel',
    defaultValue: 'Imprint',
    label: 'Imprint Link Label',
    maxLength: 30,
    category: 'page-content',
    group: 'Footer',
    type: 'short',
  },
  {
    key: 'footer.privacyLabel',
    defaultValue: 'Privacy Policy',
    label: 'Privacy Policy Link Label',
    maxLength: 30,
    category: 'page-content',
    group: 'Footer',
    type: 'short',
  },

  // ─── Navigation ─────────────────────────────────────────
  {
    key: 'nav.sessions',
    defaultValue: 'Sessions',
    label: 'Sessions Link',
    maxLength: 30,
    category: 'page-content',
    group: 'Navigation',
    type: 'short',
  },
  {
    key: 'nav.blackcard',
    defaultValue: 'Black Card',
    label: 'Black Card Link',
    maxLength: 30,
    category: 'page-content',
    group: 'Navigation',
    type: 'short',
  },
  {
    key: 'nav.apply',
    defaultValue: 'Apply',
    label: 'Apply Link',
    maxLength: 30,
    category: 'page-content',
    group: 'Navigation',
    type: 'short',
  },
  {
    key: 'nav.contact',
    defaultValue: 'Contact',
    label: 'Contact Link',
    maxLength: 30,
    category: 'page-content',
    group: 'Navigation',
    type: 'short',
  },
];

// Lookup helpers
const definitionMap = new Map(SETTING_DEFINITIONS.map((d) => [d.key, d]));

export function getDefinition(key: string): SettingDefinition | undefined {
  return definitionMap.get(key);
}

export function getDefaultValue(key: string): string {
  return definitionMap.get(key)?.defaultValue ?? '';
}

export function getDefinitionsByGroup(group: string): SettingDefinition[] {
  return SETTING_DEFINITIONS.filter((d) => d.group === group);
}

export function getAllGroups(): string[] {
  const groups = new Set(SETTING_DEFINITIONS.map((d) => d.group));
  return Array.from(groups);
}
