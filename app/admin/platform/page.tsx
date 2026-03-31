import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const platformChecks = [
  { label: "OpenAI API key", configured: Boolean(process.env.OPENAI_API_KEY), detail: "Shared across all tenants for extraction, classification, and grounded response generation." },
  { label: "App base URL", configured: Boolean(process.env.APP_BASE_URL), detail: "Used for webhook instructions and environment-aware links." },
  { label: "Encryption key", configured: Boolean(process.env.ENCRYPTION_KEY), detail: "Encrypts tenant-owned Twilio secrets at rest." },
  { label: "Database URL", configured: Boolean(process.env.DATABASE_URL), detail: "Shared multi-tenant Postgres backing the control plane and runtime state." },
];

export default function AdminPlatformPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Platform configuration</CardTitle>
          <CardDescription>System admins own shared infrastructure settings, while tenant-specific Twilio credentials are managed per tenant from the tenant management view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {platformChecks.map((check) => (
            <div key={check.label} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{check.label}</div>
                <Badge variant={check.configured ? "success" : "destructive"}>{check.configured ? "Configured" : "Missing"}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{check.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Operating model</CardTitle>
          <CardDescription>The control plane is now deliberately split into platform admin and tenant admin responsibilities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">System admin:</span> manages all tenants, tenant-owned Twilio credentials, webhooks, and platform readiness.</p>
          <p><span className="font-medium text-foreground">Business admin:</span> manages business profile, source ingestion, knowledge review, escalation policy, and conversation review for their own tenant.</p>
          <p><span className="font-medium text-foreground">Shared service:</span> OpenAI stays platform-level so model usage and extraction settings remain centralized.</p>
        </CardContent>
      </Card>
    </div>
  );
}
