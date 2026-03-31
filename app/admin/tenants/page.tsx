import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemAdminDashboardData } from "@/lib/services/admin";

export default async function AdminTenantsPage() {
  const data = await getSystemAdminDashboardData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Managed tenants</CardTitle>
        <CardDescription>System admins can view every tenant, then open a tenant to manage channel credentials and operational setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.tenants.map((tenant) => {
          const owner = tenant.members.find((member) => member.role === "owner")?.user;
          const channel = tenant.channels[0] ?? null;
          return (
            <div key={tenant.id} className="flex flex-col gap-3 rounded-2xl border p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{tenant.name}</div>
                  <Badge variant={tenant.status === "ACTIVE" ? "success" : "warning"}>{tenant.status}</Badge>
                  <Badge variant={channel?.status === "CONNECTED" ? "success" : "default"}>{channel?.status || "DISCONNECTED"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{tenant.slug} | {tenant.industryType} | Owner: {owner?.email || "Unassigned"}</div>
                <div className="text-sm text-muted-foreground">{tenant._count.sourceDocuments} sources | {tenant._count.conversations} conversations</div>
              </div>
              <Button asChild variant="outline"><Link href={`/admin/tenants/${tenant.id}`}>Open tenant</Link></Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

