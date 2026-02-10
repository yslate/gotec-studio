'use client';

import { useState, useEffect } from 'react';
import { getDefaultValue } from './settings-defaults';

/**
 * Client-side hook that returns settings values.
 * Returns defaults immediately (no flash), then updates if DB overrides exist.
 */
export function useSettings(keys: string[]): Record<string, string> {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const key of keys) {
      defaults[key] = getDefaultValue(key);
    }
    return defaults;
  });

  useEffect(() => {
    if (keys.length === 0) return;

    const params = new URLSearchParams();
    params.set('keys', keys.join(','));

    fetch(`/api/settings?${params.toString()}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch settings');
      })
      .then((data: Record<string, string>) => {
        setSettings(data);
      })
      .catch(() => {
        // Keep defaults on error
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(',')]);

  return settings;
}
