// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";
import DashboardHeader from "@/components/dashboard/header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
