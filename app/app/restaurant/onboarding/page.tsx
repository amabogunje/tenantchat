import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantOnboardingPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guided setup"
        title="Bring your assistant to life in a few simple steps"
        description="Start with your basics, upload the materials you already have, then review what we found before you go live."
        actions={<Button asChild><Link href="/app/restaurant/onboarding/review">Continue</Link></Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Add the basics</CardTitle>
            <CardDescription>For MVP, restaurant is preselected so the setup stays focused and simple.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border p-4"><div className="font-medium text-foreground">Business type</div><div>Restaurant</div></div>
            <div className="rounded-2xl border p-4"><div className="font-medium text-foreground">Website</div><div>{workspace.profile.website || "Add your website when you have it"}</div></div>
            <div className="rounded-2xl border p-4"><div className="font-medium text-foreground">Phone</div><div>{workspace.profile.phone || "Add your business phone"}</div></div>
            <div className="rounded-2xl border p-4"><div className="font-medium text-foreground">Address</div><div>{workspace.profile.address || "Add your restaurant address"}</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload what you already use</CardTitle>
            <CardDescription>Menus, brochures, flyers, PDFs, notes, and images all help us build a better first draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspace.uploadedArtifacts.length ? workspace.uploadedArtifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-2xl border p-4">
                <div className="font-medium">{artifact.filename}</div>
                <div className="mt-1 text-sm text-muted-foreground">{artifact.extractionSummary}</div>
              </div>
            )) : <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No materials uploaded yet. That is okay. Start with your website or menu when you are ready.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
