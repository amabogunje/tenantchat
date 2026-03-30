import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function AnalyticsPage() {
  const { tenant } = await getCurrentTenantContext();
  const data = tenant ? await getDashboardData(tenant.id) : null;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total conversations" value={data?.analytics.totalConversations || 0} />
        <StatCard label="Answered by bot" value={data?.analytics.answeredByBot || 0} />
        <StatCard label="Escalated" value={data?.analytics.escalated || 0} />
        <StatCard label="Unresolved" value={data?.analytics.unresolved || 0} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top intents</CardTitle>
          <CardDescription>Simple MVP analytics from persisted intent logs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.analytics.topIntents.map((item) => (
            <div key={item.intent} className="flex items-center justify-between rounded-2xl border p-4">
              <span>{item.intent}</span>
              <span className="text-sm text-muted-foreground">{item.count}</span>
            </div>
          )) || <p className="text-sm text-muted-foreground">No analytics yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
