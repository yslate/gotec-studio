import { pgTable, serial, varchar, integer, boolean, timestamp, text, pgEnum, uuid, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);
export const cardStatusEnum = pgEnum('card_status', ['active', 'locked', 'suspended']);
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'waitlist', 'cancelled', 'checked_in', 'no_show']);
export const ticketStatusEnum = pgEnum('ticket_status', ['valid', 'used', 'expired']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['new', 'read', 'archived']);
export const applicationStatusEnum = pgEnum('application_status', ['new', 'reviewed', 'accepted', 'rejected']);

// Users table - Admin and Staff accounts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Black Cards table - 100 cards with unique codes
export const blackCards = pgTable('black_cards', {
  id: serial('id').primaryKey(),
  cardNumber: integer('card_number').notNull().unique(), // 1-100 (for internal reference)
  code: varchar('code', { length: 20 }).notNull().unique(), // Unique code like "BC-X7K9M2"
  status: cardStatusEnum('status').notNull().default('active'),
  holderName: varchar('holder_name', { length: 255 }),
  holderPhone: varchar('holder_phone', { length: 50 }),
  holderEmail: varchar('holder_email', { length: 255 }),
  noShowCount: integer('no_show_count').notNull().default(0),
  suspendedUntil: timestamp('suspended_until'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Email Verification Codes table - for booking verification
export const emailVerificationCodes = pgTable('email_verification_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(), // 6-digit code
  sessionId: uuid('session_id').notNull().references(() => recordingSessions.id, { onDelete: 'cascade' }),
  cardId: integer('card_id').notNull().references(() => blackCards.id),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestPhone: varchar('guest_phone', { length: 50 }),
  verified: boolean('verified').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Recording Sessions table
export const recordingSessions = pgTable('recording_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  artistName: varchar('artist_name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  maxCardholders: integer('max_cardholders').notNull().default(15),
  maxWaitlist: integer('max_waitlist').notNull().default(5),
  maxGuestList: integer('max_guest_list').notNull().default(10),
  description: text('description'),
  isPublished: boolean('is_published').notNull().default(false),
  isCancelled: boolean('is_cancelled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bookings table - Cardholder bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => recordingSessions.id, { onDelete: 'cascade' }),
  cardId: integer('card_id').notNull().references(() => blackCards.id),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestEmail: varchar('guest_email', { length: 255 }).notNull(), // Now required
  guestPhone: varchar('guest_phone', { length: 50 }), // Now optional
  status: bookingStatusEnum('status').notNull().default('confirmed'),
  position: integer('position'), // Position in waitlist if applicable
  checkedInAt: timestamp('checked_in_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Guest List Tickets table - GL tickets with QR codes
export const guestListTickets = pgTable('guest_list_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => recordingSessions.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull().unique(), // Unique QR code
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestEmail: varchar('guest_email', { length: 255 }).notNull(), // Now required
  guestPhone: varchar('guest_phone', { length: 50 }),
  allocatedBy: varchar('allocated_by', { length: 255 }), // Artist/promoter who allocated
  status: ticketStatusEnum('status').notNull().default('valid'),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Check-ins table - Records of all check-ins
export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => recordingSessions.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id),
  ticketId: uuid('ticket_id').references(() => guestListTickets.id),
  checkedInBy: uuid('checked_in_by').references(() => users.id),
  type: varchar('type', { length: 20 }).notNull(), // 'cardholder' or 'guest_list'
  checkedInAt: timestamp('checked_in_at').notNull().defaultNow(),
});

// Contact Inquiries table
export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: inquiryStatusEnum('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Recording Applications table
export const recordingApplications = pgTable('recording_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  artistName: varchar('artist_name', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 255 }).notNull(),
  artistOrigin: varchar('artist_origin', { length: 255 }).notNull(),
  instagramUrl: varchar('instagram_url', { length: 500 }),
  soundcloudUrl: varchar('soundcloud_url', { length: 500 }),
  message: text('message').notNull(),
  status: applicationStatusEnum('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const recordingSessionsRelations = relations(recordingSessions, ({ many }) => ({
  bookings: many(bookings),
  guestListTickets: many(guestListTickets),
  checkIns: many(checkIns),
  emailVerificationCodes: many(emailVerificationCodes),
}));

export const blackCardsRelations = relations(blackCards, ({ many }) => ({
  bookings: many(bookings),
  emailVerificationCodes: many(emailVerificationCodes),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [bookings.sessionId],
    references: [recordingSessions.id],
  }),
  card: one(blackCards, {
    fields: [bookings.cardId],
    references: [blackCards.id],
  }),
}));

export const guestListTicketsRelations = relations(guestListTickets, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [guestListTickets.sessionId],
    references: [recordingSessions.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [checkIns.sessionId],
    references: [recordingSessions.id],
  }),
  booking: one(bookings, {
    fields: [checkIns.bookingId],
    references: [bookings.id],
  }),
  ticket: one(guestListTickets, {
    fields: [checkIns.ticketId],
    references: [guestListTickets.id],
  }),
  user: one(users, {
    fields: [checkIns.checkedInBy],
    references: [users.id],
  }),
}));

export const emailVerificationCodesRelations = relations(emailVerificationCodes, ({ one }) => ({
  session: one(recordingSessions, {
    fields: [emailVerificationCodes.sessionId],
    references: [recordingSessions.id],
  }),
  card: one(blackCards, {
    fields: [emailVerificationCodes.cardId],
    references: [blackCards.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BlackCard = typeof blackCards.$inferSelect;
export type NewBlackCard = typeof blackCards.$inferInsert;
export type RecordingSession = typeof recordingSessions.$inferSelect;
export type NewRecordingSession = typeof recordingSessions.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type GuestListTicket = typeof guestListTickets.$inferSelect;
export type NewGuestListTicket = typeof guestListTickets.$inferInsert;
export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type NewContactInquiry = typeof contactInquiries.$inferInsert;
export type RecordingApplication = typeof recordingApplications.$inferSelect;
export type NewRecordingApplication = typeof recordingApplications.$inferInsert;
