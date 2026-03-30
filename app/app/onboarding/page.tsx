import { IndustryType } from "@prisma/client";
import { saveOnboarding } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function OnboardingPage() {
  const { tenant } = await getCurrentTenantContext();
  const profile = tenant ? await prisma.businessProfile.findFirst({ where: { tenantId: tenant.id } }) : null;
  const hours = (profile?.hoursJson as Record<string, string> | null) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant onboarding</CardTitle>
        <CardDescription>Set the business identity, operating hours, tone, and industry defaults.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveOnboarding} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tenantName">Tenant name</Label>
            <Input id="tenantName" name="tenantName" defaultValue={tenant?.name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="industryType">Industry</Label>
            <select id="industryType" name="industryType" className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={tenant?.industryType}>
              {Object.values(IndustryType).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input id="businessName" name="businessName" defaultValue={profile?.businessName || tenant?.name} required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={profile?.description || ""} />
          </div>
          <div className="grid gap-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={profile?.phone || ""} /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={profile?.email || ""} /></div>
          <div className="grid gap-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" defaultValue={profile?.website || ""} /></div>
          <div className="grid gap-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={profile?.address || ""} /></div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="toneInstructions">Tone instructions</Label>
            <Textarea id="toneInstructions" name="toneInstructions" defaultValue={profile?.toneInstructions || "Helpful, concise, and honest."} />
          </div>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
            <div key={day} className="grid gap-2">
              <Label htmlFor={`hours${day}`}>{day}</Label>
              <Input id={`hours${day}`} name={`hours${day}`} placeholder="9am - 5pm" defaultValue={hours[day] || ""} />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button type="submit">Save onboarding</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
