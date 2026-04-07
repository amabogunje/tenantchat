import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/page-header";
import { ReviewQueue } from "@/components/workflows/review-queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function OnboardingReviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="Here is what we understood"
        description="We found your key business details, menu structure, and guest-service settings. Review the few items that matter most before customers rely on them."
        actions={<Button asChild><Link href="/app/restaurant/onboarding/preview">Continue to preview</Link></Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Extraction summary</CardTitle>
          <CardDescription>We found your hours, address, phone, menu items, catering details, and reservation settings. Only a few items still need your confirmation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border p-4">Hours found: Yes</div>
          <div className="rounded-2xl border p-4">Menu items found: {workspace.extractionSummary.menuItemsFound}</div>
          <div className="rounded-2xl border p-4">Reservation details found: Yes</div>
          <div className="rounded-2xl border p-4">Takeout details found: Yes</div>
        </CardContent>
      </Card>
      <ReviewQueue items={workspace.reviewItems} />
    </div>
  );
}
