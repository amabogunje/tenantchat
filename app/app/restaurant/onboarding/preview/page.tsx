import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/page-header";
import { AssistantPreview } from "@/components/workflows/assistant-preview";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function OnboardingPreviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preview"
        title="Preview how guests can talk to your assistant"
        description="This chat-style simulation helps you build trust before you go live. Each answer shows confidence and where it came from."
        actions={<Button asChild><Link href="/app/restaurant/onboarding/activate">Activate assistant</Link></Button>}
      />
      <AssistantPreview answers={workspace.previewAnswers} />
    </div>
  );
}
