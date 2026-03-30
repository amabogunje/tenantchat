import { saveChannel, validateChannelCredentials } from "@/components/forms/tenant-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { decryptSecret } from "@/lib/security/crypto";

export default async function ChannelPage({
  searchParams,
}: {
  searchParams?: Promise<{ validation?: string; message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const { tenant } = await getCurrentTenantContext();
  const channel = tenant
    ? await prisma.channelConnection.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { updatedAt: "desc" },
      })
    : null;
  const savedAuthToken = channel ? decryptSecret(channel.authTokenEncrypted) : "";
  const savedWebhookSecret = channel?.webhookSecretEncrypted ? decryptSecret(channel.webhookSecretEncrypted) : "";
  const webhookUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/webhooks/twilio/whatsapp`;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Twilio WhatsApp sandbox</CardTitle>
          <CardDescription>Store one WhatsApp sender per tenant for MVP runtime routing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.message ? (
            <div className="flex items-center gap-3 rounded-2xl border bg-muted p-4 text-sm">
              <Badge variant={params.validation === "success" ? "success" : "destructive"}>
                {params.validation === "success" ? "Credentials valid" : "Validation failed"}
              </Badge>
              <span>{decodeURIComponent(params.message)}</span>
            </div>
          ) : null}
          <form action={saveChannel} className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="externalNumber">WhatsApp sender</Label><Input id="externalNumber" name="externalNumber" defaultValue={channel?.externalNumber || process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"} /></div>
            <div className="grid gap-2"><Label htmlFor="accountSid">Account SID</Label><Input id="accountSid" name="accountSid" defaultValue={channel?.accountSid || process.env.TWILIO_ACCOUNT_SID || ""} /></div>
            <div className="grid gap-2"><Label htmlFor="authToken">Auth token</Label><Input id="authToken" name="authToken" type="text" defaultValue={savedAuthToken} /></div>
            <div className="grid gap-2"><Label htmlFor="webhookSecret">Webhook secret</Label><Input id="webhookSecret" name="webhookSecret" defaultValue={savedWebhookSecret} /></div>
            <div className="flex gap-3">
              <Button type="submit">Save channel configuration</Button>
            </div>
          </form>
          <form action={validateChannelCredentials}>
            <Button type="submit" variant="outline">Validate Twilio credentials</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Setup instructions</CardTitle>
          <CardDescription>Paste the webhook URL into your Twilio sandbox incoming message configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Open Twilio Console and navigate to the WhatsApp sandbox.</p>
          <p>2. Copy the inbound webhook URL below into the sandbox "When a message comes in" field.</p>
          <p>3. Keep your sandbox sender aligned with the stored external number for this tenant.</p>
          <div className="rounded-2xl border bg-muted p-4 font-mono text-xs text-foreground">{webhookUrl}</div>
        </CardContent>
      </Card>
    </div>
  );
}
