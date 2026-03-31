import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ChannelPage() {
  const { tenant } = await requireTenantAdminContext();
  const channel = tenant
    ? await prisma.channelConnection.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { updatedAt: "desc" },
      })
    : null;
  const webhookUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/webhooks/twilio/whatsapp`;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Messaging status</CardTitle>
          <CardDescription>Your TenantChat operator manages WhatsApp credentials and webhook setup. This page is read-only for business admins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Badge variant={channel?.status === "CONNECTED" ? "success" : "warning"}>{channel?.status || "DISCONNECTED"}</Badge>
            <span>{channel ? "Your WhatsApp sender is configured." : "No WhatsApp sender has been connected yet."}</span>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="font-medium text-foreground">Sender</div>
            <div>{channel?.externalNumber || "Awaiting platform setup"}</div>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="font-medium text-foreground">Webhook URL</div>
            <div className="break-all font-mono text-xs text-foreground">{webhookUrl}</div>
          </div>
          <p>If you need changes to Twilio credentials or sandbox wiring, contact your system admin. You can keep working on business profile, sources, and knowledge in the tenant workspace.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>What you control here</CardTitle>
          <CardDescription>Business admins focus on tenant knowledge, customer escalation, and profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Use onboarding and business settings to keep hours, contact details, and escalation contacts current.</p>
          <p>Use sources and knowledge review to publish only the information customers should see.</p>
          <p>Use conversations and analytics to monitor performance once the system admin connects your channel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
