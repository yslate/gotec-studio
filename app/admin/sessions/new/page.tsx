import { SessionForm } from '@/components/admin/session-form';

export default function NewSessionPage() {
  return (
    <div className="max-w-2xl">
      <SessionForm mode="create" />
    </div>
  );
}
