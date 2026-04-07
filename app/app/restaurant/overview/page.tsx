import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/page-header";
import { StatusCard } from "@/components/cards/status-card";
import { ReviewQueue } from "@/components/workflows/review-queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantOverviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="A calm control tower for your assistant"
        description="See what the system understood, what still needs your attention, and what customers are asking today."
        actions={
          <>
            <Button asChild><Link href="/app/restaurant/setup">Review setup</Link></Button>
            <Button asChild variant="outline"><Link href="/app/restaurant/preview">Preview assistant</Link></Button>
          </>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatusCard label="Assistant status" value={workspace.assistantStatus.replace("_", " ")} detail="Draft, needs review, or live" />
        <StatusCard label="Conversations today" value={workspace.analytics.conversationVolume} detail="WhatsApp conversations and follow-ups" />
        <StatusCard label="Answered automatically" value={`${workspace.analytics.autoAnswerRate}%`} detail="Questions resolved without a handoff" />
        <StatusCard label="Unresolved" value={workspace.conversations.filter((item) => item.status === "unresolved").length} detail="Needs clarification or more knowledge" />
        <StatusCard label="Needs review" value={workspace.reviewItems.length} detail="Business-critical details to confirm" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <ReviewQueue items={workspace.reviewItems} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's updates</CardTitle>
              <CardDescription>Temporary changes customers should hear right away.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.dailyUpdates.map((update) => (
                <div key={update.id} className="rounded-2xl border p-4">
                  <div className="font-medium">{update.message}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Effective {update.effectiveDate}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Small updates, fast.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {workspace.quickActions.map((action) => (
                <Button key={action.href} asChild variant="outline" className="justify-start"><a href={action.href}>{action.label}</a></Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

