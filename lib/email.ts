import * as postmark from 'postmark';

const client = process.env.POSTMARK_API_KEY
  ? new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@gotec-records.de';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Minimal palette matching the dark homepage
const C = {
  bg: '#141414',
  text: '#d4d4d4',
  muted: '#737373',
  white: '#fafafa',
  rule: 'rgba(255,255,255,0.08)',
  accent: '#6E2931',
};

// ── Shared components ────────────────────────

function emailWrapper(content: string, previewText: string = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>GOTEC Records</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ''}
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${C.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: ${C.text}; line-height: 1.7; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${C.bg};">
    <tr>
      <td align="center" style="padding: 60px 24px 48px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width: 520px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 48px;">
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: ${C.white}; text-transform: uppercase; letter-spacing: 3px;">
                GOTEC Records
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td>${content}</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 48px;">
              <div style="height: 1px; background-color: ${C.rule}; margin-bottom: 24px;"></div>
              <p style="margin: 0; font-size: 11px; color: ${C.muted}; letter-spacing: 0.3px;">
                &copy; ${new Date().getFullYear()} GOTEC Records &mdash; Karlsruhe
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/** Ghost-style button matching the homepage aesthetic */
function emailButton(text: string, url: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
      <tr>
        <td style="border: 1px solid rgba(255,255,255,0.2); text-align: center;">
          <a href="${url}" target="_blank" style="display: block; padding: 12px 32px; font-size: 11px; font-weight: 400; color: ${C.white}; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/** Clean session detail block */
function sessionBlock(data: {
  title: string;
  artistName: string;
  formattedDate: string;
  startTime: string;
  endTime: string;
  cardNumber?: number;
}) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td style="padding-bottom: 14px;">
          <p style="margin: 0; font-size: 10px; color: ${C.accent}; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Session</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 6px;">
          <p style="margin: 0; font-size: 16px; color: ${C.white}; font-weight: 600;">${data.title}</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 4px;">
          <p style="margin: 0; font-size: 13px; color: ${C.text};">${data.artistName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 4px;">
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">${data.formattedDate}</p>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">${data.startTime} &ndash; ${data.endTime}</p>
        </td>
      </tr>
      ${data.cardNumber ? `
      <tr>
        <td style="padding-top: 4px;">
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">Black Card <span style="color: ${C.white}; font-weight: 600;">#${data.cardNumber}</span></p>
        </td>
      </tr>
      ` : ''}
    </table>
  `;
}

/** Minimal ticket code display */
function ticketCodeBlock(code: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td style="text-align: center; padding: 28px 0; border-top: 1px solid ${C.rule}; border-bottom: 1px solid ${C.rule};">
          <p style="margin: 0 0 10px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Ticket Code</p>
          <p style="margin: 0; font-size: 28px; font-weight: 300; color: ${C.white}; letter-spacing: 6px; font-family: 'Courier New', monospace;">${code}</p>
        </td>
      </tr>
    </table>
  `;
}

/** Thin horizontal rule */
function rule() {
  return `<div style="height: 1px; background-color: ${C.rule}; margin: 32px 0;"></div>`;
}

// ── Helpers ───────────────────────────────────

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function p(text: string, opts?: { muted?: boolean; small?: boolean }) {
  const color = opts?.muted ? C.muted : C.text;
  const size = opts?.small ? '12px' : '14px';
  return `<p style="margin: 0 0 16px 0; font-size: ${size}; color: ${color}; line-height: 1.7;">${text}</p>`;
}

// ── Email types ──────────────────────────────

interface BookingConfirmationData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  cardNumber: number;
  status: 'confirmed' | 'waitlist';
  position?: number;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping booking confirmation:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const isConfirmed = data.status === 'confirmed';

  const subject = isConfirmed
    ? `Booking confirmed \u2014 ${data.sessionTitle}`
    : `Waitlist \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${isConfirmed
      ? p('your booking has been confirmed.')
      : p(`you are on position ${data.position} of the waitlist.`)
    }

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${isConfirmed
      ? p(`Please bring your <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong> and show it at the entrance.`, { muted: true, small: true })
      : p('We will notify you by email as soon as a spot becomes available.', { muted: true, small: true })
    }

    ${emailButton('View Bookings', `${APP_URL}/my-bookings`)}
  `;

  const htmlBody = emailWrapper(content, isConfirmed
    ? `Your booking for ${data.sessionTitle} has been confirmed.`
    : `You are on the waitlist for ${data.sessionTitle}.`
  );

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Booking confirmation sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send booking confirmation:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface WaitlistPromotionData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  cardNumber: number;
}

export async function sendWaitlistPromotion(data: WaitlistPromotionData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping waitlist promotion:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = `Spot available \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('a spot has opened up and your booking has been confirmed.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${p(`Please bring your <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong> and show it at the entrance.`, { muted: true, small: true })}

    ${emailButton('View Bookings', `${APP_URL}/my-bookings`)}
  `;

  const htmlBody = emailWrapper(content, `A spot has opened up! Your booking for ${data.sessionTitle} has been confirmed.`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Waitlist promotion sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send waitlist promotion:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface CancellationData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  cancelledByUser: boolean;
}

export async function sendCancellationNotification(data: CancellationData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping cancellation:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = data.cancelledByUser
    ? `Cancelled \u2014 ${data.sessionTitle}`
    : `Session cancelled \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${data.cancelledByUser
      ? p('your booking has been cancelled.')
      : p('unfortunately, the following session has been cancelled.')
    }

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 16px; color: ${C.muted}; font-weight: 600; text-decoration: line-through;">${data.sessionTitle}</p>
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">${data.artistName} &mdash; ${formattedDate}</p>
        </td>
      </tr>
    </table>

    ${!data.cancelledByUser
      ? p('We apologize for the inconvenience. Check out our other sessions.', { muted: true, small: true })
      : ''
    }

    ${emailButton('Browse Sessions', APP_URL)}
  `;

  const htmlBody = emailWrapper(content, data.cancelledByUser
    ? `Your booking for ${data.sessionTitle} has been cancelled.`
    : `The session ${data.sessionTitle} has been cancelled.`
  );

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Cancellation notification sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send cancellation notification:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface GLTicketData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  ticketCode: string;
  allocatedBy?: string;
  qrDataUrl?: string;
}

export async function sendGLTicket(data: GLTicketData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping GL ticket:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const ticketUrl = `${APP_URL}/gl/${data.ticketCode}`;
  const subject = `Guest List \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p(`you are on the guest list${data.allocatedBy ? ` of <strong style="color: ${C.white};">${data.allocatedBy}</strong>` : ''}.`)}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCodeBlock(data.ticketCode)}

    ${data.qrDataUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
      <tr>
        <td align="center">
          <img src="${data.qrDataUrl}" alt="QR Code" width="160" height="160" style="display: block;" />
        </td>
      </tr>
    </table>
    ` : ''}

    ${p('Show this code or the QR code at the entrance.', { muted: true, small: true })}

    ${emailButton('View Ticket', ticketUrl)}
  `;

  const htmlBody = emailWrapper(content, `Your guest list ticket for ${data.sessionTitle}.`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] GL ticket sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send GL ticket:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface ReminderData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  cardNumber?: number;
  ticketCode?: string;
  type: 'cardholder' | 'guest_list';
}

export async function sendSessionReminder(data: ReminderData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping reminder:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = `Tomorrow \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('your recording session is tomorrow.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${data.type === 'cardholder'
      ? p(`Please bring your <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong>.`, { muted: true, small: true })
      : `${ticketCodeBlock(data.ticketCode!)}
         ${p('Show this code at the entrance.', { muted: true, small: true })}`
    }

    ${data.type === 'cardholder'
      ? emailButton('View Bookings', `${APP_URL}/my-bookings`)
      : emailButton('View Ticket', `${APP_URL}/gl/${data.ticketCode}`)
    }
  `;

  const htmlBody = emailWrapper(content, `Reminder: ${data.sessionTitle} is tomorrow!`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Session reminder sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send session reminder:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface CheckInConfirmationData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
}

export async function sendCheckInConfirmation(data: CheckInConfirmationData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping check-in confirmation:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const subject = `Check-in \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('you have been checked in.')}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 16px; color: ${C.white}; font-weight: 600;">${data.sessionTitle}</p>
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">with ${data.artistName}</p>
        </td>
      </tr>
    </table>

    ${p('Enjoy the session.', { muted: true, small: true })}
  `;

  const htmlBody = emailWrapper(content, `You have been checked in at ${data.sessionTitle}.`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Check-in confirmation sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send check-in confirmation:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface DJGuestListData {
  to: string;
  artistName: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  tickets: Array<{
    guestName: string;
    code: string;
    qrDataUrl: string;
  }>;
}

export async function sendDJGuestListEmail(data: DJGuestListData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping DJ guest list:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const ticketCount = data.tickets.length;
  const subject = `Guest List Tickets \u2014 ${data.sessionTitle}`;

  const ticketCards = data.tickets.map((ticket, i) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0; border-top: 1px solid ${C.rule};">
      <tr>
        <td style="padding: 20px 0; vertical-align: top;">
          <p style="margin: 0 0 2px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Ticket ${i + 1} of ${ticketCount}</p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: ${C.white};">${ticket.guestName}</p>
          <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: 300; color: ${C.white}; letter-spacing: 4px; font-family: 'Courier New', monospace;">${ticket.code}</p>
          <a href="${APP_URL}/gl/${ticket.code}" target="_blank" style="font-size: 11px; color: ${C.muted}; text-decoration: underline;">Open ticket</a>
        </td>
        <td style="width: 110px; vertical-align: top; text-align: right; padding-top: 20px;">
          <img src="${ticket.qrDataUrl}" alt="QR Code" width="100" height="100" style="display: block;" />
        </td>
      </tr>
    </table>
  `).join('');

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.artistName}</strong>,`)}

    ${p(`here are your <strong style="color: ${C.white};">${ticketCount} guest list ticket${ticketCount > 1 ? 's' : ''}</strong> for the upcoming session. Forward the individual tickets to your guests.`)}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCards}

    ${rule()}

    ${p('Each ticket is valid only once. Your guests show the QR code or ticket code at the entrance.', { muted: true, small: true })}
  `;

  const htmlBody = emailWrapper(content, `${ticketCount} guest list tickets for ${data.sessionTitle}`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log(`[Email] DJ guest list (${ticketCount} tickets) sent to:`, data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send DJ guest list:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface VerificationCodeData {
  to: string;
  guestName: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  verificationCode: string;
  cardCode: string;
}

export async function sendVerificationCode(data: VerificationCodeData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping verification code:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = `Verification code \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('confirm your email address to complete the booking.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td style="text-align: center; padding: 32px 0; border-top: 1px solid ${C.rule}; border-bottom: 1px solid ${C.rule};">
          <p style="margin: 0 0 10px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Verification Code</p>
          <p style="margin: 0; font-size: 36px; font-weight: 300; color: ${C.white}; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.verificationCode}</p>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: ${C.muted};">Valid for 15 minutes</p>
        </td>
      </tr>
    </table>

    ${p(`Black Card: <strong style="color: ${C.white};">${data.cardCode}</strong>`, { muted: true, small: true })}

    ${rule()}

    ${p('If you did not request this booking, you can ignore this email.', { muted: true, small: true })}
  `;

  const htmlBody = emailWrapper(content, `Your verification code: ${data.verificationCode}`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Verification code sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send verification code:', error);
    return { sent: false, error };
  }
}

// ── Application workflow emails ──────────────

interface ApplicationAcceptedData {
  to: string;
  artistName: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionId: string;
}

export async function sendApplicationAccepted(data: ApplicationAcceptedData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping application accepted:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = `Application accepted \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.artistName}</strong>,`)}

    ${p('your application has been accepted. Your recording session has been created.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${p('We look forward to your session. Feel free to contact us if you have any questions.', { muted: true, small: true })}

    ${emailButton('View Session', `${APP_URL}/book/${data.sessionId}`)}
  `;

  const htmlBody = emailWrapper(content, `Your application for ${data.sessionTitle} has been accepted!`);

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Application accepted sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send application accepted:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface ApplicationRejectedData {
  to: string;
  artistName: string;
  rejectionReason?: string;
}

export async function sendApplicationRejected(data: ApplicationRejectedData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping application rejected:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const subject = 'GOTEC Records \u2014 Application';

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.artistName}</strong>,`)}

    ${p('thank you for your application to GOTEC Records.')}

    ${p('Unfortunately, we cannot offer you a recording slot at this time.')}

    ${data.rejectionReason ? `
      ${rule()}
      <p style="margin: 0 0 6px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Reason</p>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: ${C.text}; line-height: 1.7; white-space: pre-wrap;">${data.rejectionReason}</p>
      ${rule()}
    ` : ''}

    ${p('Feel free to reapply when new slots become available.', { muted: true, small: true })}

    ${emailButton('Submit New Application', `${APP_URL}/apply`)}
  `;

  const htmlBody = emailWrapper(content, 'Update about your application to GOTEC Records.');

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Application rejected sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send application rejected:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

interface SlotTakenData {
  to: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export async function sendSlotTaken(data: SlotTakenData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping slot taken:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const subject = 'Recording Slot Assigned';

  const content = `
    ${p(`Hello <strong style="color: ${C.white};">${data.artistName}</strong>,`)}

    ${p('the recording slot you applied for has been assigned.')}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: ${C.muted}; text-decoration: line-through;">${formattedDate}</p>
          <p style="margin: 0; font-size: 13px; color: ${C.muted}; text-decoration: line-through;">${formatTime(data.startTime)} &ndash; ${formatTime(data.endTime)}</p>
        </td>
      </tr>
    </table>

    ${p('Your application remains active and we will contact you as soon as a suitable slot becomes available.', { muted: true, small: true })}

    ${emailButton('View Available Slots', `${APP_URL}/apply`)}
  `;

  const htmlBody = emailWrapper(content, 'Your selected recording slot has been assigned.');

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Slot taken notification sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send slot taken notification:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

export function isEmailConfigured(): boolean {
  return !!client;
}

/**
 * Wraps an email send call for fire-and-forget use.
 * Logs the result properly instead of silently swallowing errors.
 */
export function fireAndForgetEmail(
  emailPromise: Promise<{ sent: boolean; reason?: string; error?: unknown }>,
  context: string
): void {
  emailPromise.then((result) => {
    if (!result.sent && result.reason !== 'not_configured') {
      console.error(`[Email] ${context} — failed to send:`, result.error);
    }
  }).catch((err) => {
    console.error(`[Email] ${context} — unexpected error:`, err);
  });
}
