import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssistantPreview } from "@/components/workflows/assistant-preview";
import { ReviewQueue } from "@/components/workflows/review-queue";
import { publishKnowledgeAction } from "@/components/forms/tenant-actions";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function OnboardingReviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
  if (tenant.status === "ACTIVE") redirect("/app/restaurant/overview");
  if (workspace.uploadedArtifacts.length === 0) redirect("/app/restaurant/onboarding");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Step 3 of 3</div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Review what we found</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          This is the first version of your assistant. We&apos;ve pulled together your links and uploaded materials into a draft your guests can use once you publish.
        </p>
      </div>
      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <CardTitle>What we pulled in</CardTitle>
          <CardDescription>We surface the important details instead of raw processing steps.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border p-4">Links added: {workspace.uploadedArtifacts.filter((artifact) => artifact.type === "website").length}</div>
          <div className="rounded-2xl border p-4">Documents uploaded: {workspace.uploadedArtifacts.filter((artifact) => artifact.type !== "website").length}</div>
          <div className="rounded-2xl border p-4">Menu items found: {workspace.extractionSummary.menuItemsFound}</div>
          <div className="rounded-2xl border p-4">Items needing review: {workspace.reviewItems.length}</div>
        </CardContent>
      </Card>
      <ReviewQueue items={workspace.reviewItems} />
      <AssistantPreview answers={workspace.previewAnswers} description="A quick trust check before you go live." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="sm:w-auto">
          <a href="/app/restaurant/onboarding/documents">Back</a>
        </Button>
        <form action={publishKnowledgeAction}>
          <Button type="submit" size="lg">Publish and open dashboard</Button>
        </form>
      </div>
    </div>
  );
}