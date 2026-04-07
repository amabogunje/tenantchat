import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { StatusCard } from "@/components/cards/status-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantAnalyticsPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  if (workspace.mode === "starter") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Useful trends will show up here later"
          description="Once guests start messaging your assistant, we will keep analytics simple and focused on what helps you improve."
        />
        <section className="grid gap-4 md:grid-cols-3">
          <StatusCard label="Conversation volume" value={0} />
          <StatusCard label="Auto-answer rate" value="0%" />
          <StatusCard label="Escalations" value={0} />
        </section>
        <Card>
          <CardHeader>
            <CardTitle>What you will learn</CardTitle>
            <CardDescription>No noisy dashboard, just meaningful restaurant signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>What customers ask most often</div>
            <div>Where your assistant needs a human handoff</div>
            <div>Top menu, reservation, takeout, and catering questions</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Simple signals that help you improve"
        description="No overbuilt dashboard here. Just the trends that help you understand what guests ask and where the assistant still needs support."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard label="Conversation volume" value={workspace.analytics.conversationVolume} />
        <StatusCard label="Auto-answer rate" value={`${workspace.analytics.autoAnswerRate}%`} />
        <StatusCard label="Escalations" value={workspace.analytics.escalations} />
        <StatusCard label="Reservation trend" value={`${workspace.analytics.reservationTrend}%`} detail="Share of conversations touching reservations" />
      </section>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Common customer questions</CardTitle>
            <CardDescription>What people ask the most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspace.analytics.topQuestions.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top menu item inquiries</CardTitle>
            <CardDescription>What guests are most curious about right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspace.analytics.topMenuItemInquiries.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Still unanswered</CardTitle>
            <CardDescription>Topics worth tightening up next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {workspace.analytics.unansweredTopics.map((topic) => (
              <div key={topic} className="rounded-2xl border px-4 py-3">{topic}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
