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
<html lang="de">
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
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">${data.startTime} &ndash; ${data.endTime} Uhr</p>
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
function ticketCode(code: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td style="text-align: center; padding: 28px 0; border-top: 1px solid ${C.rule}; border-bottom: 1px solid ${C.rule};">
          <p style="margin: 0 0 10px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Ticket-Code</p>
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
  return new Date(date).toLocaleDateString('de-DE', {
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
    ? `Buchung bestätigt \u2014 ${data.sessionTitle}`
    : `Warteliste \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${isConfirmed
      ? p('deine Buchung wurde bestätigt.')
      : p(`du stehst auf Position ${data.position} der Warteliste.`)
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
      ? p(`Bitte bringe deine <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong> mit und zeige sie am Eingang vor.`, { muted: true, small: true })
      : p('Wir benachrichtigen dich per E-Mail, sobald ein Platz frei wird.', { muted: true, small: true })
    }

    ${emailButton('Buchungen ansehen', `${APP_URL}/my-bookings`)}
  `;

  const htmlBody = emailWrapper(content, isConfirmed
    ? `Deine Buchung für ${data.sessionTitle} wurde bestätigt.`
    : `Du stehst auf der Warteliste für ${data.sessionTitle}.`
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
  const subject = `Platz frei \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('ein Platz ist frei geworden und deine Buchung wurde bestätigt.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${p(`Bitte bringe deine <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong> mit und zeige sie am Eingang vor.`, { muted: true, small: true })}

    ${emailButton('Buchungen ansehen', `${APP_URL}/my-bookings`)}
  `;

  const htmlBody = emailWrapper(content, `Ein Platz ist frei geworden! Deine Buchung für ${data.sessionTitle} wurde bestätigt.`);

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
    ? `Storniert \u2014 ${data.sessionTitle}`
    : `Abgesagt \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${data.cancelledByUser
      ? p('deine Buchung wurde storniert.')
      : p('leider wurde die folgende Session abgesagt.')
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
      ? p('Wir entschuldigen uns für die Unannehmlichkeiten. Schau dir gerne unsere anderen Sessions an.', { muted: true, small: true })
      : ''
    }

    ${emailButton('Sessions entdecken', APP_URL)}
  `;

  const htmlBody = emailWrapper(content, data.cancelledByUser
    ? `Deine Buchung für ${data.sessionTitle} wurde storniert.`
    : `Die Session ${data.sessionTitle} wurde leider abgesagt.`
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
}

export async function sendGLTicket(data: GLTicketData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping GL ticket:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const ticketUrl = `${APP_URL}/gl/${data.ticketCode}`;
  const subject = `Gästeliste \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p(`du stehst auf der Gästeliste${data.allocatedBy ? ` von <strong style="color: ${C.white};">${data.allocatedBy}</strong>` : ''}.`)}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCode(data.ticketCode)}

    ${p('Zeige diesen Code oder den QR-Code am Eingang vor.', { muted: true, small: true })}

    ${emailButton('Ticket anzeigen', ticketUrl)}
  `;

  const htmlBody = emailWrapper(content, `Dein Gästeliste-Ticket für ${data.sessionTitle}.`);

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
  const subject = `Morgen \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('deine Recording Session ist morgen.')}

    ${sessionBlock({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${data.type === 'cardholder'
      ? p(`Bitte bringe deine <strong style="color: ${C.white};">Black Card #${data.cardNumber}</strong> mit.`, { muted: true, small: true })
      : `${ticketCode(data.ticketCode!)}
         ${p('Zeige diesen Code am Eingang vor.', { muted: true, small: true })}`
    }

    ${data.type === 'cardholder'
      ? emailButton('Buchungen ansehen', `${APP_URL}/my-bookings`)
      : emailButton('Ticket anzeigen', `${APP_URL}/gl/${data.ticketCode}`)
    }
  `;

  const htmlBody = emailWrapper(content, `Erinnerung: ${data.sessionTitle} findet morgen statt!`);

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
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('du wurdest eingecheckt.')}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 16px; color: ${C.white}; font-weight: 600;">${data.sessionTitle}</p>
          <p style="margin: 0; font-size: 13px; color: ${C.muted};">mit ${data.artistName}</p>
        </td>
      </tr>
    </table>

    ${p('Viel Spaß bei der Session.', { muted: true, small: true })}
  `;

  const htmlBody = emailWrapper(content, `Du wurdest bei ${data.sessionTitle} eingecheckt.`);

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
  const subject = `Bestätigungscode \u2014 ${data.sessionTitle}`;

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.guestName}</strong>,`)}

    ${p('bestätige deine E-Mail-Adresse, um die Buchung abzuschließen.')}

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
          <p style="margin: 0 0 10px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Bestätigungscode</p>
          <p style="margin: 0; font-size: 36px; font-weight: 300; color: ${C.white}; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.verificationCode}</p>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: ${C.muted};">Gültig für 15 Minuten</p>
        </td>
      </tr>
    </table>

    ${p(`Black Card: <strong style="color: ${C.white};">${data.cardCode}</strong>`, { muted: true, small: true })}

    ${rule()}

    ${p('Falls du diese Buchung nicht angefordert hast, kannst du diese E-Mail ignorieren.', { muted: true, small: true })}
  `;

  const htmlBody = emailWrapper(content, `Dein Bestätigungscode: ${data.verificationCode}`);

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

// ──────────────────────────────────────────────

interface ApplicationRejectionData {
  to: string;
  artistName: string;
  rejectionReason?: string;
}

export async function sendApplicationRejection(data: ApplicationRejectionData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping application rejection:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const subject = 'Deine Bewerbung \u2014 GOTEC Records';

  const content = `
    ${p(`Hallo <strong style="color: ${C.white};">${data.artistName}</strong>,`)}

    ${p('vielen Dank für dein Interesse an GOTEC Records und deine Bewerbung.')}

    ${p('Leider können wir deine Bewerbung derzeit nicht berücksichtigen.')}

    ${data.rejectionReason ? `
      ${rule()}
      <p style="margin: 0 0 6px 0; font-size: 10px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 2px;">Begründung</p>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: ${C.text}; line-height: 1.7; white-space: pre-wrap;">${data.rejectionReason}</p>
      ${rule()}
    ` : ''}

    ${p('Du kannst dich jederzeit erneut bewerben.', { muted: true, small: true })}

    ${emailButton('Erneut bewerben', `${APP_URL}/apply`)}
  `;

  const htmlBody = emailWrapper(content, 'Update zu deiner Bewerbung bei GOTEC Records.');

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: data.to,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound',
    });
    console.log('[Email] Application rejection sent to:', data.to);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send application rejection:', error);
    return { sent: false, error };
  }
}

// ──────────────────────────────────────────────

export function isEmailConfigured(): boolean {
  return !!client;
}
