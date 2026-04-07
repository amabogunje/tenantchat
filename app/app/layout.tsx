import { redirect } from "next/navigation";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getTenantVertical } from "@/lib/services/vertical-workspace";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");

  const vertical = getTenantVertical(tenant);
  if (!vertical) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">This vertical is not ready yet</h1>
          <p className="mt-3 text-muted-foreground">TenantChat is being redesigned around a restaurant-first experience. Restaurant workspaces are available now, and additional verticals will plug into the same shared foundation next.</p>
        </div>
      </div>
    );
  }

  return <AppShell vertical={vertical} businessName={tenant.name} status={tenant.status === "ACTIVE" ? "live" : "needs_review"}>{children}</AppShell>;
}
