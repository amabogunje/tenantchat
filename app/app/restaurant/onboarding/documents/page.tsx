import { redirect } from "next/navigation";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";
import { SetupDocumentsForm } from "@/components/workflows/setup-documents-form";

export default async function RestaurantOnboardingDocumentsPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");

  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
  if (tenant.status === "ACTIVE") redirect("/app/restaurant/overview");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <SetupDocumentsForm
        uploadedFiles={workspace.uploadedArtifacts
          .filter((artifact) => artifact.type !== "website")
          .map((artifact) => ({
            id: artifact.id,
            filename: artifact.filename,
            status: artifact.processingStatus,
            summary: artifact.extractionSummary,
          }))}
      />
    </div>
  );
}