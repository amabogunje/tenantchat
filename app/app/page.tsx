import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function AppOverviewPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) {
    return <div className="rounded-3xl border bg-card p-8">Create your first tenant from onboarding.</div>;
  }
  const data = await getDashboardData(tenant.id);
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{tenant.name}</h1>
            <Badge variant={tenant.status === "ACTIVE" ? "success" : "warning"}>{tenant.status}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">{data.profile?.description || "Upload business content and publish approved knowledge to activate grounded replies."}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild><Link href="/app/sources">Add sources</Link></Button>
          <Button asChild variant="outline"><Link href="/app/settings">Review business settings</Link></Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Conversations" value={data.analytics.totalConversations} />
        <StatCard label="Answered by bot" value={data.analytics.answeredByBot} />
        <StatCard label="Escalated" value={data.analytics.escalated} />
        <StatCard label="Unresolved" value={data.analytics.unresolved} />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent sources</CardTitle>
            <CardDescription>Website URLs, PDFs, menus, and notes waiting for review or already processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sources.map((source) => (
              <div key={source.id} className="rounded-2xl border p-4">
                <div className="font-medium">{source.originalName}</div>
                <div className="text-sm text-muted-foreground">{source.sourceType} | {source.ingestionStatus}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform-managed messaging</CardTitle>
            <CardDescription>WhatsApp credentials are configured by your TenantChat operator, while you manage business knowledge and escalation rules here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Need a sender change, new Twilio account, or webhook update? Reach out to your system administrator.</p>
            <Button asChild variant="outline"><Link href="/app/channel">View channel status</Link></Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
