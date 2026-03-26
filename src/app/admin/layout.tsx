import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <AdminSidebar />
      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
