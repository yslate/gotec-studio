import { getAllSettings } from '@/lib/settings';
import { SettingsPageContent } from '@/components/admin/settings-page-content';

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Einstellungen</h1>
        <p className="text-sm text-muted-foreground">
          Seiteninhalte und Texte verwalten
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Seiteninhalte
        </h2>
        <SettingsPageContent initialSettings={settings} />
      </div>
    </div>
  );
}
