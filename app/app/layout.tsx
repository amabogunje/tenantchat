import { requireTenantAdminContext } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { tenantNav } from "@/components/layout/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireTenantAdminContext();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
      <Sidebar eyebrow="TenantChat" title={tenant?.name || "Business Admin"} navItems={tenantNav} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
