'use client';

import { Input } from '@/components/ui/input';

interface SettingsTextFieldProps {
  label: string;
  value: string;
  maxLength: number;
  type: 'short' | 'long';
  onChange: (value: string) => void;
}

export function SettingsTextField({ label, value, maxLength, type, onChange }: SettingsTextFieldProps) {
  const remaining = maxLength - value.length;
  const isOver = remaining < 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        <span className={`text-[11px] tabular-nums ${isOver ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      {type === 'long' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={3}
          className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[72px]"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
        />
      )}
    </div>
  );
}
