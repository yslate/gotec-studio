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
<html lang="en">
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
                This email was automatically sent.
              </p>
              <p style="margin: 0; font-size: 11px; color: ${COLORS.textMuted};">
                &copy; ${new Date().getFullYear()} GOTEC Records. All rights reserved.
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
                <span style="color: ${COLORS.textMuted};">Date:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px;">${data.formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Time:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px;">${data.startTime} – ${data.endTime}</span>
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
            Your Ticket Code
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
  return new Date(date).toLocaleDateString('en-US', {
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
    ? `Booking confirmed: ${data.sessionTitle}`
    : `Waitlist: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      ${isConfirmed
        ? `your booking has been confirmed! ${statusBadge('Confirmed', 'success')}`
        : `you are now on the waitlist. ${statusBadge(`Position ${data.position}`, 'warning')}`
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
        Please bring your <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong> and show it at the entrance.
      </p>
    ` : `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
        We will notify you by email as soon as a spot becomes available.
      </p>
    `}

    ${emailButton('View My Bookings', `${APP_URL}/my-bookings`, true)}
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
  const subject = `Spot available! ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      Good news! A spot has become available and your booking has been confirmed.
      ${statusBadge('Now confirmed', 'success')}
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
      Please bring your <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong> and show it at the entrance.
    </p>

    ${emailButton('View My Bookings', `${APP_URL}/my-bookings`, true)}
  `;

  const htmlBody = emailWrapper(content, `A spot has become available! Your booking for ${data.sessionTitle} has been confirmed.`);

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
    ? `Booking cancelled: ${data.sessionTitle}`
    : `Session cancelled: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      ${data.cancelledByUser
        ? `your booking has been successfully cancelled. ${statusBadge('Cancelled', 'info')}`
        : `unfortunately, the following session has been cancelled. ${statusBadge('Cancelled', 'error')}`
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
        We apologize for the inconvenience. Feel free to check out our other sessions.
      </p>
    ` : ''}

    ${emailButton('Book New Session', APP_URL, true)}
  `;

  const htmlBody = emailWrapper(content, data.cancelledByUser
    ? `Your booking for ${data.sessionTitle} has been cancelled.`
    : `The session ${data.sessionTitle} has unfortunately been cancelled.`
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
  qrDataUrl?: string; // base64 PNG QR code
}

export async function sendGLTicket(data: GLTicketData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping GL ticket:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const ticketUrl = `${APP_URL}/gl/${data.ticketCode}`;
  const subject = `Guest List: ${data.sessionTitle}`;

  const qrSection = data.qrDataUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td align="center" style="padding: 0;">
          <img src="${data.qrDataUrl}" alt="QR Code" width="180" height="180" style="display: block; border: 6px solid ${COLORS.white};" />
        </td>
      </tr>
    </table>
  ` : '';

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      you're on the guest list${data.allocatedBy ? ` by <strong>${data.allocatedBy}</strong>` : ''}!
      ${statusBadge('Guest List', 'success')}
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCodeBox(data.ticketCode)}

    ${qrSection}

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
      Show this code or the QR code at the entrance.
    </p>

    ${emailButton('View Ticket in Browser', ticketUrl, true)}
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
  const subject = `Reminder: ${data.sessionTitle} tomorrow!`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Don't forget – your recording session is tomorrow!
      ${statusBadge('Tomorrow', 'warning')}
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
        Please bring your <strong style="color: ${COLORS.text};">Black Card #${data.cardNumber}</strong>.
      </p>
    ` : `
      ${ticketCodeBox(data.ticketCode!)}
      <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
        Show this code at the entrance.
      </p>
    `}

    ${data.type === 'cardholder'
      ? emailButton('My Bookings', `${APP_URL}/my-bookings`, true)
      : emailButton('View Ticket', `${APP_URL}/gl/${data.ticketCode}`, true)
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

  const subject = `Checked In: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      You have been successfully checked in! ${statusBadge('Checked In', 'success')}
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border-left: 3px solid #166534; margin: 24px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${COLORS.white};">
            ${data.sessionTitle}
          </h2>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.textMuted};">
            with ${data.artistName}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted}; text-align: center;">
      Enjoy the session!
    </p>
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

// ============================================
// DJ GUEST LIST (CONSOLIDATED EMAIL)
// ============================================

interface DJGuestListTicket {
  code: string;
  guestName: string;
  qrDataUrl: string; // base64 PNG
}

interface DJGuestListData {
  to: string;
  artistName: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  tickets: DJGuestListTicket[];
}

export async function sendDJGuestListEmail(data: DJGuestListData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping DJ guest list:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const formattedDate = formatDate(data.date);
  const ticketCount = data.tickets.length;
  const subject = `DJ Guest List: ${data.sessionTitle} (${ticketCount} Ticket${ticketCount > 1 ? 's' : ''})`;

  const ticketCards = data.tickets.map((ticket, i) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border: 1px solid ${COLORS.border}; margin: 16px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">
                  Ticket ${i + 1} of ${ticketCount}
                </p>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: ${COLORS.text};">
                  ${ticket.guestName}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">
                  Ticket Code
                </p>
                <p style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                  ${ticket.code}
                </p>
                <a href="${APP_URL}/gl/${ticket.code}" target="_blank" style="font-size: 12px; color: ${COLORS.primary}; text-decoration: underline;">
                  Open ticket in browser
                </a>
              </td>
              <td style="width: 120px; vertical-align: top; text-align: right;">
                <img src="${ticket.qrDataUrl}" alt="QR Code" width="110" height="110" style="display: block; border: 4px solid ${COLORS.white};" />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `).join('');

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.artistName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      here are your <strong>${ticketCount} guest list ticket${ticketCount > 1 ? 's' : ''}</strong> for the upcoming session.
      Forward the individual tickets to your guests.
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    ${ticketCards}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(110, 41, 49, 0.15); border-left: 3px solid ${COLORS.primary}; margin: 24px 0;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">
            <strong style="color: ${COLORS.text};">Note:</strong> Each ticket is valid only once and cannot be used twice.
            Your guests show the QR code or ticket code at the entrance.
          </p>
        </td>
      </tr>
    </table>
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
  const subject = `Verification code for ${data.sessionTitle}`;

  const verificationCodeDisplay = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.primary}; margin: 24px 0;">
      <tr>
        <td style="padding: 32px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">
            Your Verification Code
          </p>
          <p style="margin: 0; font-size: 48px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${data.verificationCode}
          </p>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">
            Code valid for 15 minutes
          </p>
        </td>
      </tr>
    </table>
  `;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.guestName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Please confirm your email address to complete the booking for the following session:
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
      If you did not request this booking, you can ignore this email.
    </p>
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

// ============================================
// APPLICATION WORKFLOW EMAILS
// ============================================

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
  const subject = `Application accepted: ${data.sessionTitle}`;

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.artistName}</strong>,
    </p>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
      Congratulations! Your application has been accepted.
      ${statusBadge('Accepted', 'success')}
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Your recording session has been created:
    </p>

    ${sessionInfoBox({
      title: data.sessionTitle,
      artistName: data.artistName,
      formattedDate,
      startTime: formatTime(data.startTime),
      endTime: formatTime(data.endTime),
    })}

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
      We look forward to your session! Feel free to contact us if you have any questions.
    </p>

    ${emailButton('View Session', `${APP_URL}/book/${data.sessionId}`, true)}
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

// ============================================

interface ApplicationRejectedData {
  to: string;
  artistName: string;
}

export async function sendApplicationRejected(data: ApplicationRejectedData) {
  if (!client) {
    console.log('[Email] Postmark not configured, skipping application rejected:', data.to);
    return { sent: false, reason: 'not_configured' };
  }

  const subject = 'GOTEC Records — Application';

  const content = `
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.artistName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      thank you for your application to GOTEC Records.
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Unfortunately, we cannot offer you a recording slot at this time. We received many strong applications and the selection was not easy.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
      Feel free to reapply when new slots become available. We wish you continued success!
    </p>

    ${emailButton('Submit New Application', `${APP_URL}/apply`, true)}
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

// ============================================

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
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      Hello <strong>${data.artistName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.text};">
      the recording slot you applied for has been assigned:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background}; border-left: 3px solid ${COLORS.textMuted}; margin: 24px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Date:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px; text-decoration: line-through; opacity: 0.7;">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px;">
                <span style="color: ${COLORS.textMuted};">Time:</span>
                <span style="color: ${COLORS.text}; margin-left: 8px; text-decoration: line-through; opacity: 0.7;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px 0; font-size: 13px; color: ${COLORS.textMuted};">
      Your application remains active and we will contact you as soon as a suitable slot becomes available.
    </p>

    ${emailButton('View Available Slots', `${APP_URL}/apply`, true)}
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

// ============================================
// UTILITY FUNCTION: Check if email is configured
// ============================================

export function isEmailConfigured(): boolean {
  return !!client;
}
