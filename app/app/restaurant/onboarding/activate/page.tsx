import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function OnboardingActivatePage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
  if (workspace.mode === "starter") redirect("/app/restaurant/onboarding/review");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activate"
        title="You are ready to go live"
        description="Your assistant has enough trusted information to help with hours, menu questions, reservations, takeout, and catering."
        actions={<Button asChild><Link href="/app/restaurant/overview">Go to overview</Link></Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Before launch</CardTitle>
          <CardDescription>A final confidence check.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>We found {workspace.extractionSummary.menuItemsFound} menu items.</div>
          <div>We found reservation, takeout, and catering details.</div>
          <div>{workspace.reviewItems.length} items still need your attention, but your assistant can already answer many common questions.</div>
        </CardContent>
      </Card>
    </div>
  );
}
