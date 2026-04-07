import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { AssistantPreview } from "@/components/workflows/assistant-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantPreviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assistant Preview"
        title="Preview your assistant anytime"
        description="Use this live-feeling simulation to review tone, intent coverage, confidence, and source transparency before making changes visible to guests."
      />
      <AssistantPreview answers={workspace.previewAnswers} description="Preloaded test prompts cover reservations, dietary questions, and catering inquiries." />
      <Card>
        <CardHeader>
          <CardTitle>What this preview is checking</CardTitle>
          <CardDescription>It is not just static Q and A. It reflects restaurant intents, actions, and the knowledge your assistant currently depends on.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Intent routing: reservation, takeout, catering, dietary, and general questions</div>
          <div>Action readiness: booking, takeout handoff, catering request capture, menu link, location sharing</div>
          <div>Confidence and sources: every answer shows both so you can decide what still needs review</div>
        </CardContent>
      </Card>
    </div>
  );
}
