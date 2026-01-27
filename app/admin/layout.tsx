import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 pt-16 lg:pt-6 lg:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
