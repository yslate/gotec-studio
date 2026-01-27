import * as postmark from 'postmark';

const client = process.env.POSTMARK_API_KEY
  ? new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@gotec-records.de';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Brand colors matching the site
const COLORS = {
  background: '#1a1a1a',
  cardBg: '#242424',
  primary: '#6E2931',
  primaryHover: '#8a3540',
  text: '#e5e5e5',
  textMuted: '#a3a3a3',
  border: 'rgba(255,255,255,0.1)',
  white: '#ffffff',
};

// Base email template wrapper
function emailWrapper(content: string, previewText: string = '') {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>GOTEC DJ-Studio</title>
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
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: ${COLORS.text}; line-height: 1.6;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 0.5px;">
                GOTEC DJ-Studio
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px;">
                Recording Sessions
              </p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.cardBg}; border: 1px solid ${COLORS.border};">
                <tr>
                  <td style="padding: 32px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: ${COLORS.textMuted};">
                Diese E-Mail wurde automatisch versendet.
              </p>
              <p style="margin: 0; font-size: 11px; color: ${COLORS.textMuted};">
                &copy; ${new Date().getFullYear()} GOTEC Records. Alle Rechte vorbehalten.
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

// Styled button component
function emailButton(text: string, url: string, fullWidth: boolean = false) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${fullWidth ? 'width="100%"' : ''}>
      <tr>
        <td style="background-color: ${COLORS.primary}; text-align: center;">
          <a href="${url}" target="_blank" style="display: block; padding: 14px 28px; font-size: 13px; font-weight: 600; color: ${COLORS.white}; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// Session info box component
function sessionInfoBox(data: {
  title: string;
  artistName: string;
  formattedDate: string;
  startTime: string;
  endTime: string;
  cardNumber?: number;
  ticketCode?: string;
}) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border-left: 3px solid ${COLORS.primary}; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: ${COLORS.white};">
            ${data.title}
          </h2>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Artist:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px;">${data.artistName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Datum:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px;">${data.formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Uhrzeit:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px;">${data.startTime} – ${data.endTime} Uhr</span>
              </td>
            </tr>
            ${data.cardNumber ? `
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Black Card:</span>
                <span style="color: ${COLORS.primary}; margin-left: 8px; font-weight: 600;">#${data.cardNumber}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Ticket code display component
function ticketCodeBox(code: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.primary}; margin: 24px 0;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">
            Dein Ticket-Code
          </p>
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 4px; font-family: 'Courier New', monospace;">
            ${code}
          </p>
        </td>
      </tr>
    </table>
  `;
}

// Status badge component
function statusBadge(text: string, type: 'success' | 'warning' | 'info' | 'error') {
  const colors = {
    success: { bg: '#166534', text: '#86efac' },
    warning: { bg: '#854d0e', text: '#fde047' },
    info: { bg: '#1e40af', text: '#93c5fd' },
    error: { bg: '#991b1b', text: '#fca5a5' },
  };
  const color = colors[type];

  return `
    <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: ${color.bg}; color: ${color.text};">
      ${text}
    </span>
  `;
}

// Format date helper
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time helper (strip seconds if present)
function formatTime(time: string) {
  return time.slice(0, 5);
}

// ============================================
// EMAIL TYPES
// ============================================

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
    ? `Buchung bestätigt: ${data.sessionTitle}`
    : `Warteliste: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      ${isConfirmed
        ? `deine Buchung wurde erfolgreich bestätigt! ${statusBadge('Bestätigt', 'success')}`
        : `du stehst jetzt auf der Warteliste. ${statusBadge(`Position ${data.position}`, 'warning')}`
      }
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${isConfirmed ? `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
        Bitte bringe deine <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong> mit und zeige sie am Eingang vor.
      </p>
    ` : `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
        Wir benachrichtigen dich per E-Mail, sobald ein Platz für dich frei wird.
      </p>
    `}

    ${emailButton('Meine Buchungen ansehen', `${APP_URL}/my-bookings`, true)}
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

// ============================================

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
  const subject = `Platz frei! ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      Gute Nachrichten! Ein Platz ist frei geworden und deine Buchung wurde bestätigt.
      ${statusBadge('Jetzt bestätigt', 'success')}
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
      Bitte bringe deine <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong> mit und zeige sie am Eingang vor.
    </p>

    ${emailButton('Meine Buchungen ansehen', `${APP_URL}/my-bookings`, true)}
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

// ============================================

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
    ? `Buchung storniert: ${data.sessionTitle}`
    : `Session abgesagt: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      ${data.cancelledByUser
        ? `deine Buchung wurde erfolgreich storniert. ${statusBadge('Storniert', 'info')}`
        : `leider wurde die folgende Session abgesagt. ${statusBadge('Abgesagt', 'error')}`
      }
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border-left: 3px solid ${data.cancelledByUser ? COLORS.textMuted : '#991b1b'}; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${COLORS.white}; text-decoration: line-through; opacity: 0.7;">
            ${data.sessionTitle}
          </h2>
          <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted};">
            ${data.artistName} • ${formattedDate}
          </p>
        </td>
      </tr>
    </table>

    ${!data.cancelledByUser ? `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
        Wir entschuldigen uns für die Unannehmlichkeiten. Schau dir gerne unsere anderen Sessions an.
      </p>
    ` : ''}

    ${emailButton('Neue Session buchen', APP_URL, true)}
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

// ============================================

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
  const subject = `Gästeliste: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      du stehst auf der Gästeliste${data.allocatedBy ? ` von <strong>${data.allocatedBy}</strong>` : ''}!
      ${statusBadge('Gästeliste', 'success')}
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCodeBox(data.ticketCode)}

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
      Zeige diesen Code oder den QR-Code am Eingang vor.
    </p>

    ${emailButton('Ticket mit QR-Code anzeigen', ticketUrl, true)}
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

// ============================================

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
  const subject = `Erinnerung: ${data.sessionTitle} morgen!`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Nicht vergessen – morgen ist deine Recording Session!
      ${statusBadge('Morgen', 'warning')}
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
      cardNumber: data.cardNumber,
    })}

    ${data.type === 'cardholder' ? `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
        Bitte bringe deine <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong> mit.
      </p>
    ` : `
      ${ticketCodeBox(data.ticketCode!)}
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
        Zeige diesen Code am Eingang vor.
      </p>
    `}

    ${data.type === 'cardholder'
      ? emailButton('Meine Buchungen', `${APP_URL}/my-bookings`, true)
      : emailButton('Ticket anzeigen', `${APP_URL}/gl/${data.ticketCode}`, true)
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

// ============================================

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

  const subject = `Eingecheckt: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Du wurdest erfolgreich eingecheckt! ${statusBadge('Eingecheckt', 'success')}
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border-left: 3px solid #166534; margin: 24px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${COLORS.white};">
            ${data.sessionTitle}
          </h2>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.textMuted};">
            mit ${data.artistName}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
      Viel Spaß bei der Session!
    </p>
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

// ============================================
// EMAIL VERIFICATION
// ============================================

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
  const subject = `Bestätigungscode für ${data.sessionTitle}`;

  const verificationCodeDisplay = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.primary}; margin: 24px 0;">
      <tr>
        <td style="padding: 32px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">
            Dein Bestätigungscode
          </p>
          <p style="margin: 0; font-size: 48px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${data.verificationCode}
          </p>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">
            Code gültig für 15 Minuten
          </p>
        </td>
      </tr>
    </table>
  `;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hallo <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Bitte bestätige deine E-Mail-Adresse, um die Buchung für folgende Session abzuschließen:
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${verificationCodeDisplay}

    <p style="margin: 0 0 8px 0; font-size: 13px; color: ${COLORS.textMuted};">
      <strong style="color: ${COLORS.text};">Black Card:</strong> ${data.cardCode}
    </p>

    <p style="margin: 24px 0 0 0; font-size: 12px; color: ${COLORS.textMuted};">
      Falls du diese Buchung nicht angefordert hast, kannst du diese E-Mail ignorieren.
    </p>
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

// ============================================
// UTILITY FUNCTION: Check if email is configured
// ============================================

export function isEmailConfigured(): boolean {
  return !!client;
}
