import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { ReviewQueue } from "@/components/workflows/review-queue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantSetupPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Setup"
        title="Upload what you already have"
        description="Your website, menus, flyers, and notes help us build the first version of your assistant. We show you what we found in plain English, then you confirm the important parts."
        actions={
          <>
            <Button asChild><Link href="/app/restaurant/onboarding">Open guided setup</Link></Button>
            <Button variant="outline">Reprocess</Button>
            <Button variant="outline">Add more materials</Button>
          </>
        }
      />
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website</CardTitle>
              <CardDescription>Your website is usually the fastest place for us to find hours, contact details, reservation info, and core menu references.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] border p-4">
                <div className="font-medium">{workspace.profile.website}</div>
                <div className="mt-2 text-sm text-muted-foreground">Your website has been processed.</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What we processed</CardTitle>
              <CardDescription>Behind the scenes we analyze your materials, but here we focus on what the system understood.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.uploadedArtifacts.map((artifact) => (
                <div key={artifact.id} className="rounded-[1.5rem] border p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="font-medium">{artifact.filename}</div>
                      <div className="text-sm text-muted-foreground">{artifact.type.replace(/_/g, " ")}</div>
                    </div>
                    <div className="text-sm font-medium text-primary">{artifact.processingStatus.replace(/_/g, " ")}</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{artifact.extractionSummary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>What we found</CardTitle>
            <CardDescription>A quick summary before you review details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>We found your hours: {workspace.extractionSummary.hoursFound ? "Yes" : "Needs review"}</div>
            <div>We found your address: {workspace.extractionSummary.addressFound ? "Yes" : "Needs review"}</div>
            <div>We found your phone: {workspace.extractionSummary.phoneFound ? "Yes" : "Needs review"}</div>
            <div>We found {workspace.extractionSummary.menuItemsFound} menu items</div>
            <div>We found {workspace.extractionSummary.cateringServicesFound} catering packages</div>
            <div>Reservation details found: {workspace.extractionSummary.reservationDetailsFound ? "Yes" : "No"}</div>
            <div>Takeout details found: {workspace.extractionSummary.takeoutDetailsFound ? "Yes" : "No"}</div>
            <div>Items needing review: {workspace.extractionSummary.itemsNeedingReview}</div>
            <Button asChild className="mt-3 w-full"><Link href="/app/restaurant/preview">Preview assistant</Link></Button>
          </CardContent>
        </Card>
      </section>
      <ReviewQueue items={workspace.reviewItems} />
    </div>
  );
}
