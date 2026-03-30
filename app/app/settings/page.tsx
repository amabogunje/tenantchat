import { updateEscalationContact } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function SettingsPage() {
  const { tenant } = await getCurrentTenantContext();
  const [profile, escalation] = tenant ? await Promise.all([
    prisma.businessProfile.findFirst({ where: { tenantId: tenant.id } }),
    prisma.escalationRule.findFirst({ where: { tenantId: tenant.id } }),
  ]) : [null, null];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>Current tenant-facing details used at runtime after publish.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Name:</span> {profile?.businessName || tenant?.name}</p>
          <p><span className="font-medium text-foreground">Website:</span> {profile?.website || "Not set"}</p>
          <p><span className="font-medium text-foreground">Phone:</span> {profile?.phone || "Not set"}</p>
          <p><span className="font-medium text-foreground">Published:</span> {profile?.isPublished ? "Yes" : "No"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Escalation rule</CardTitle>
          <CardDescription>Who should the bot hand off to when it cannot answer confidently?</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEscalationContact} className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="contactLabel">Contact label</Label><Input id="contactLabel" name="contactLabel" defaultValue={escalation?.contactLabel || "Owner"} /></div>
            <div className="grid gap-2"><Label htmlFor="contactValue">Contact value</Label><Input id="contactValue" name="contactValue" defaultValue={escalation?.contactValue || ""} /></div>
            <div className="grid gap-2"><Label htmlFor="acknowledgementMsg">Customer acknowledgement</Label><Textarea id="acknowledgementMsg" name="acknowledgementMsg" defaultValue={escalation?.acknowledgementMsg || "Thanks, a human will follow up shortly."} /></div>
            <Button type="submit">Save escalation settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
