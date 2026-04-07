import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
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
        title={workspace.mode === "starter" ? "See how the preview works before you go live" : "Preview your assistant anytime"}
        description={workspace.mode === "starter" ? "These sample prompts show the kinds of questions guests will ask. Once we process your website and menu, this preview becomes specific to your restaurant." : "Use this live-feeling simulation to review tone, intent coverage, confidence, and source transparency before making changes visible to guests."}
        actions={workspace.mode === "starter" ? <Button asChild><Link href="/app/restaurant/setup">Add materials first</Link></Button> : undefined}
      />
      <AssistantPreview answers={workspace.previewAnswers} description="Preloaded test prompts cover reservations, dietary questions, and catering inquiries." />
      <Card>
        <CardHeader>
          <CardTitle>What this preview is checking</CardTitle>
          <CardDescription>It is designed to build trust, not expose technical details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Can the assistant understand reservation, takeout, and catering questions?</div>
          <div>Is the tone right for your restaurant?</div>
          <div>Does each answer have enough confidence and a clear source?</div>
        </CardContent>
      </Card>
    </div>
  );
}
