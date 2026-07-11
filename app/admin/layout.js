import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-0">
        {children}
      </main>
    </div>
  );
}