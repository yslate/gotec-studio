/**
 * Timezone-aware date utilities for GOTEC Records.
 * All dates use Europe/Berlin timezone to avoid UTC off-by-one issues.
 */

const TIMEZONE = 'Europe/Berlin';

/**
 * Get today's date as YYYY-MM-DD string in Europe/Berlin timezone.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/**
 * Get tomorrow's date as YYYY-MM-DD string in Europe/Berlin timezone.
 */
export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}
