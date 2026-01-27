import { z } from 'zod';

// Phone validation (German format) - now optional
const phoneRegex = /^(\+49|0)[1-9]\d{6,14}$/;

export const phoneSchema = z.string()
  .transform(val => val.replace(/\s/g, '')) // Remove spaces
  .refine(val => phoneRegex.test(val), {
    message: 'Ungültige Telefonnummer',
  });

// Optional phone schema
export const optionalPhoneSchema = z.string()
  .transform(val => val.replace(/\s/g, ''))
  .refine(val => val === '' || phoneRegex.test(val), {
    message: 'Ungültige Telefonnummer',
  })
  .optional();

// Card code validation (format: BC-XXXXXX)
const cardCodeRegex = /^BC-[A-Z0-9]{6}$/;

export const cardCodeSchema = z.string()
  .transform(val => val.toUpperCase().trim())
  .refine(val => cardCodeRegex.test(val), {
    message: 'Ungültiger Kartencode (Format: BC-XXXXXX)',
  });

// Step 1: Request verification code
export const requestVerificationSchema = z.object({
  sessionId: z.string().uuid(),
  cardCode: cardCodeSchema,
  guestName: z.string().min(2).max(255),
  guestEmail: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
  guestPhone: optionalPhoneSchema,
});

// Step 2: Verify email and complete booking
export const verifyAndBookSchema = z.object({
  verificationId: z.string().uuid(),
  code: z.string().length(6, { message: 'Bestätigungscode muss 6 Zeichen haben' }),
});

// Legacy: Direct booking (for backwards compatibility)
export const createBookingSchema = z.object({
  sessionId: z.string().uuid(),
  cardNumber: z.number().min(1).max(100),
  guestName: z.string().min(2).max(255),
  guestEmail: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
  guestPhone: optionalPhoneSchema,
});

// Cancel and lookup now use email instead of phone
export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
});

export const lookupBookingsSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
});

// Session schemas
export const createSessionSchema = z.object({
  title: z.string().min(2).max(255),
  artistName: z.string().min(2).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxCardholders: z.number().min(1).max(50).default(15),
  maxWaitlist: z.number().min(0).max(20).default(5),
  maxGuestList: z.number().min(0).max(30).default(10),
  description: z.string().max(2000).optional(),
  isPublished: z.boolean().default(false),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  isCancelled: z.boolean().optional(),
});

// Card schemas
export const updateCardSchema = z.object({
  holderName: z.string().max(255).optional(),
  holderPhone: phoneSchema.optional(),
  holderEmail: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
});

export const lockCardSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Guest list ticket schemas - Email is now required
export const createGLTicketSchema = z.object({
  sessionId: z.string().uuid(),
  guestName: z.string().min(2).max(255),
  guestEmail: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
  guestPhone: optionalPhoneSchema,
  allocatedBy: z.string().max(255).optional(),
});

export const createBulkGLTicketsSchema = z.object({
  sessionId: z.string().uuid(),
  tickets: z.array(z.object({
    guestName: z.string().min(2).max(255),
    guestEmail: z.string().email({ message: 'Ungültige E-Mail-Adresse' }),
    guestPhone: optionalPhoneSchema,
    allocatedBy: z.string().max(255).optional(),
  })).min(1).max(50),
});

// Check-in schemas
export const checkInSchema = z.object({
  code: z.string().min(1), // Can be card number or QR code
  sessionId: z.string().uuid(),
});

// Admin schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  role: z.enum(['admin', 'staff']).default('staff'),
});

// Type exports
export type RequestVerificationInput = z.infer<typeof requestVerificationSchema>;
export type VerifyAndBookInput = z.infer<typeof verifyAndBookSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type LookupBookingsInput = z.infer<typeof lookupBookingsSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type LockCardInput = z.infer<typeof lockCardSchema>;
export type CreateGLTicketInput = z.infer<typeof createGLTicketSchema>;
export type CreateBulkGLTicketsInput = z.infer<typeof createBulkGLTicketsSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
