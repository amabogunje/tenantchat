import { redirect } from "next/navigation";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";
import { SetupLinksForm } from "@/components/workflows/setup-links-form";

export default async function RestaurantOnboardingPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
  if (tenant.status === "ACTIVE") redirect("/app/restaurant/overview");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <SetupLinksForm existingLinks={workspace.uploadedArtifacts.filter((artifact) => artifact.type === "website" && artifact.sourceUrl).map((artifact) => artifact.sourceUrl!)} />
    </div>
  );
}