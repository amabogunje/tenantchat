import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { getSystemAdminDashboardData } from "@/lib/services/admin";

export default async function AdminOverviewPage() {
  const data = await getSystemAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">System control plane</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">Manage tenant onboarding, tenant-owned Twilio credentials, and platform readiness from one place. Business admins stay in their own workspace for profile and knowledge operations.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild><Link href="/admin/tenants">Review tenants</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/platform">Platform status</Link></Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Tenants" value={data.tenantCount} />
        <StatCard label="Active tenants" value={data.activeTenantCount} />
        <StatCard label="Connected channels" value={data.connectedChannels} />
        <StatCard label="Open conversations" value={data.openConversations} />
        <StatCard label="Escalated" value={data.escalatedConversations} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent tenant workspaces</CardTitle>
            <CardDescription>Each tenant keeps its own business knowledge while platform operations stay centralized here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tenants.map((tenant) => {
              const owner = tenant.members.find((member) => member.role === "owner")?.user;
              const channel = tenant.channels[0] ?? null;
              const profile = tenant.businessProfiles[0] ?? null;
              return (
                <div key={tenant.id} className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{tenant.name}</div>
                      <Badge variant={tenant.status === "ACTIVE" ? "success" : "warning"}>{tenant.status}</Badge>
                      <Badge variant={channel?.status === "CONNECTED" ? "success" : "default"}>{channel?.status || "DISCONNECTED"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Owner: {owner?.email || "Unassigned"} | Industry: {tenant.industryType}</div>
                    <div className="text-sm text-muted-foreground">{profile?.businessName || tenant.name} | {tenant._count.sourceDocuments} sources | {tenant._count.conversations} conversations</div>
                  </div>
                  <Button asChild variant="outline"><Link href={`/admin/tenants/${tenant.id}`}>Manage tenant</Link></Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform readiness</CardTitle>
            <CardDescription>Shared services are configured once, while per-tenant channels are managed individually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>OpenAI key</span><Badge variant={data.platform.openAiConfigured ? "success" : "destructive"}>{data.platform.openAiConfigured ? "Configured" : "Missing"}</Badge></div>
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>App base URL</span><Badge variant={data.platform.appBaseUrlConfigured ? "success" : "destructive"}>{data.platform.appBaseUrlConfigured ? "Configured" : "Missing"}</Badge></div>
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>Encryption key</span><Badge variant={data.platform.encryptionConfigured ? "success" : "destructive"}>{data.platform.encryptionConfigured ? "Configured" : "Missing"}</Badge></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

