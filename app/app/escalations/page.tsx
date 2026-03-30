import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function EscalationsPage() {
  const { tenant } = await getCurrentTenantContext();
  const escalations = tenant ? await prisma.escalationEvent.findMany({ where: { conversation: { tenantId: tenant.id } }, include: { conversation: { include: { customer: true } } }, orderBy: { createdAt: "desc" } }) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escalations</CardTitle>
        <CardDescription>Low-confidence answers and human handoff requests are summarized here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {escalations.map((item) => (
          <div key={item.id} className="rounded-2xl border p-5">
            <div className="font-medium">{item.conversation.customer.phone}</div>
            <div className="mt-2 text-sm text-muted-foreground">Reason: {item.reason}</div>
            <p className="mt-3 text-sm">{item.summary || "No summary captured."}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
