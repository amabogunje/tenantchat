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
  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  if (workspace.mode === "starter") {
    if (workspace.uploadedArtifacts.length > 0) {
      redirect("/app/restaurant/onboarding");
    }

    return (
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center px-6 py-12">
        <Card className="w-full rounded-[2rem] border-border/70 bg-card/95 shadow-xl shadow-black/5">
          <CardHeader className="space-y-5 p-8 sm:p-10">
            <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              TenantChat for restaurants
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Let&apos;s get your system ready</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Add a few links, upload the documents you already use, and we&apos;ll turn that into the first version of your restaurant assistant. You won&apos;t see the dashboard until it&apos;s ready.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0 sm:p-10 sm:pt-0">
            <div className="grid gap-3 rounded-[1.75rem] bg-muted/50 p-5 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-2xl bg-background px-4 py-4">
                <div className="font-medium text-foreground">1. Add your links</div>
                <div className="mt-1">Website, Instagram, Facebook, or any page customers already see.</div>
              </div>
              <div className="rounded-2xl bg-background px-4 py-4">
                <div className="font-medium text-foreground">2. Upload documents</div>
                <div className="mt-1">Menus, flyers, brochures, PDFs, photos, and notes.</div>
              </div>
              <div className="rounded-2xl bg-background px-4 py-4">
                <div className="font-medium text-foreground">3. Review and publish</div>
                <div className="mt-1">Check what we found, then make your assistant live.</div>
              </div>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/app/restaurant/onboarding">Start setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <CardTitle>Today&apos;s updates</CardTitle>
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