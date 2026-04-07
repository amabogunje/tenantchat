import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getTenantVertical, getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantSettingsPage() {
  const { tenant, user } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  const vertical = getTenantVertical(tenant);
  if (!workspace || !vertical) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="A few preferences, without the overwhelm"
        description="Keep owner details, notifications, WhatsApp connection status, escalation preferences, and assistant style in one simple place."
        actions={<Button>Save preferences</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Owner and notification preferences</CardTitle>
            <CardDescription>These stay light on purpose.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2"><Label>Owner name</Label><Input defaultValue={user.name || "Restaurant owner"} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input defaultValue={user.email || ""} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Escalation preference</Label><Input defaultValue="Notify me when catering, complaint, or low-confidence questions need a human" /></div>
            <div className="grid gap-2 md:col-span-2"><Label>WhatsApp connection</Label><div className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">Connected through your TenantChat setup team</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assistant behavior</CardTitle>
            <CardDescription>Simple controls backed by the restaurant vertical behavior model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>Tone</span><Badge>{vertical.assistantBehavior.tone}</Badge></div>
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>Verbosity</span><Badge>{vertical.assistantBehavior.verbosity}</Badge></div>
            <div className="flex items-center justify-between rounded-2xl border p-4"><span>Upsell enabled</span><Badge variant={vertical.assistantBehavior.upsellEnabled ? "success" : "default"}>{vertical.assistantBehavior.upsellEnabled ? "On" : "Off"}</Badge></div>
            <div className="rounded-2xl border p-4">
              <div className="font-medium text-foreground">Escalation rules</div>
              <div className="mt-2">Low confidence: {vertical.assistantBehavior.escalationRules.lowConfidence ? "On" : "Off"}</div>
              <div>Complaint: {vertical.assistantBehavior.escalationRules.complaint ? "On" : "Off"}</div>
              <div>Pricing ambiguity: {vertical.assistantBehavior.escalationRules.pricingAmbiguity ? "On" : "Off"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
