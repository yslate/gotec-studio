import { db, siteSettings } from '@/db';
import { inArray } from 'drizzle-orm';
import { getDefaultValue, SETTING_DEFINITIONS } from './settings-defaults';

/**
 * Get settings for specific keys. Returns a map of key -> value,
 * falling back to defaults for keys not in the database.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Start with defaults
  for (const key of keys) {
    result[key] = getDefaultValue(key);
  }

  if (keys.length === 0) return result;

  // Override with DB values
  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, keys));

  for (const row of rows) {
    result[row.key] = row.value;
  }

  return result;
}

/**
 * Get a single setting value by key, falling back to default.
 */
export async function getSetting(key: string): Promise<string> {
  const settings = await getSettings([key]);
  return settings[key];
}

/**
 * Get all settings (defaults + overrides). Used by admin API.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Start with all defaults
  for (const def of SETTING_DEFINITIONS) {
    result[def.key] = def.defaultValue;
  }

  // Override with DB values
  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings);

  for (const row of rows) {
    result[row.key] = row.value;
  }

  return result;
}
