'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsTextField } from './settings-text-field';
import { getAllGroups, getDefinitionsByGroup, type SettingDefinition } from '@/lib/settings-defaults';

interface SettingsPageContentProps {
  initialSettings: Record<string, string>;
}

function GroupSection({
  group,
  definitions,
  settings,
  onSettingsChange,
}: {
  group: string;
  definitions: SettingDefinition[];
  settings: Record<string, string>;
  onSettingsChange: (updated: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);

    const payload: Record<string, string> = {};
    for (const def of definitions) {
      payload[def.key] = settings[def.key] ?? def.defaultValue;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      const updated = await res.json();
      onSettingsChange(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span>{group}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t space-y-4">
          {definitions.map((def) =>
            def.type === 'select' && def.options ? (
              <div key={def.key} className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{def.label}</label>
                <select
                  value={settings[def.key] ?? def.defaultValue}
                  onChange={(e) => onSettingsChange({ ...settings, [def.key]: e.target.value })}
                  className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {def.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <SettingsTextField
                key={def.key}
                label={def.label}
                value={settings[def.key] ?? def.defaultValue}
                maxLength={def.maxLength}
                type={def.type === 'select' ? 'short' : def.type}
                onChange={(val) => onSettingsChange({ ...settings, [def.key]: val })}
              />
            )
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
            {saved && <span className="text-xs text-primary">Gespeichert</span>}
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsPageContent({ initialSettings }: SettingsPageContentProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const groups = getAllGroups();

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <GroupSection
          key={group}
          group={group}
          definitions={getDefinitionsByGroup(group)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      ))}
    </div>
  );
}
