import { notFound } from "next/navigation";
import { saveManagedChannel, validateManagedChannelCredentials } from "@/components/forms/tenant-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decryptSecret } from "@/lib/security/crypto";
import { getManagedTenant } from "@/lib/services/admin";

export default async function AdminTenantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams?: Promise<{ validation?: string; message?: string }>;
}) {
  const { tenantId } = await params;
  const query = searchParams ? await searchParams : undefined;
  const tenant = await getManagedTenant(tenantId);

  if (!tenant) {
    notFound();
  }

  const profile = tenant.businessProfiles[0] ?? null;
  const channel = tenant.channels[0] ?? null;
  const escalation = tenant.escalationRules[0] ?? null;
  const owner = tenant.members.find((member) => member.role === "owner")?.user;
  const savedAuthToken = channel ? decryptSecret(channel.authTokenEncrypted) : "";
  const savedWebhookSecret = channel?.webhookSecretEncrypted ? decryptSecret(channel.webhookSecretEncrypted) : "";
  const webhookUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/webhooks/twilio/whatsapp`;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-card p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{tenant.name}</h1>
            <Badge variant={tenant.status === "ACTIVE" ? "success" : "warning"}>{tenant.status}</Badge>
            <Badge variant={channel?.status === "CONNECTED" ? "success" : "default"}>{channel?.status || "DISCONNECTED"}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-muted-foreground">System admins manage channel credentials here, while the tenant admin keeps business profile and approved knowledge up to date.</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Managed WhatsApp configuration</CardTitle>
            <CardDescription>These credentials are stored on behalf of the tenant and used for their outbound Twilio traffic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {query?.message ? (
              <div className="flex items-center gap-3 rounded-2xl border bg-muted p-4 text-sm">
                <Badge variant={query.validation === "success" ? "success" : "destructive"}>
                  {query.validation === "success" ? "Credentials valid" : "Validation failed"}
                </Badge>
                <span>{decodeURIComponent(query.message)}</span>
              </div>
            ) : null}
            <form action={saveManagedChannel} className="space-y-4">
              <input type="hidden" name="tenantId" value={tenant.id} />
              <div className="grid gap-2"><Label htmlFor="externalNumber">WhatsApp sender</Label><Input id="externalNumber" name="externalNumber" defaultValue={channel?.externalNumber || "whatsapp:+14155238886"} /></div>
              <div className="grid gap-2"><Label htmlFor="accountSid">Account SID</Label><Input id="accountSid" name="accountSid" defaultValue={channel?.accountSid || ""} /></div>
              <div className="grid gap-2"><Label htmlFor="authToken">Auth token</Label><Input id="authToken" name="authToken" type="text" defaultValue={savedAuthToken} /></div>
              <div className="grid gap-2"><Label htmlFor="webhookSecret">Webhook secret</Label><Input id="webhookSecret" name="webhookSecret" defaultValue={savedWebhookSecret} /></div>
              <Button type="submit">Save managed channel</Button>
            </form>
            <form action={validateManagedChannelCredentials}>
              <input type="hidden" name="tenantId" value={tenant.id} />
              <Button type="submit" variant="outline">Validate Twilio credentials</Button>
            </form>
            <div className="rounded-2xl border bg-muted p-4 text-xs text-foreground">
              <div className="mb-2 font-medium">Webhook URL</div>
              <div className="break-all font-mono">{webhookUrl}</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant summary</CardTitle>
              <CardDescription>Quick operational context before you touch messaging configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Owner:</span> {owner?.email || "Unassigned"}</p>
              <p><span className="font-medium text-foreground">Industry:</span> {tenant.industryType}</p>
              <p><span className="font-medium text-foreground">Business profile:</span> {profile?.businessName || tenant.name}</p>
              <p><span className="font-medium text-foreground">Phone:</span> {profile?.phone || "Not set"}</p>
              <p><span className="font-medium text-foreground">Website:</span> {profile?.website || "Not set"}</p>
              <p><span className="font-medium text-foreground">Escalation contact:</span> {escalation?.contactValue || "Not set"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Operational volume</CardTitle>
              <CardDescription>Helps you prioritize which tenants need channel attention first.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Sources:</span> {tenant._count.sourceDocuments}</p>
              <p><span className="font-medium text-foreground">Conversations:</span> {tenant._count.conversations}</p>
              <p><span className="font-medium text-foreground">Published offerings:</span> {tenant._count.offerings}</p>
              <p><span className="font-medium text-foreground">Published FAQs:</span> {tenant._count.faqs}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

