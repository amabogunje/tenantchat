import { requireSystemAdmin } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { systemAdminNav } from "@/components/layout/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSystemAdmin();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
      <Sidebar eyebrow="TenantChat" title="System Admin" navItems={systemAdminNav} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
