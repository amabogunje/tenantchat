import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantProfilePage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = await getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
  if (workspace.mode === "starter") redirect("/app/restaurant/onboarding");
  const profile = workspace.profile;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Restaurant Profile"
        title="Keep the basics accurate"
        description="These are the details your guests rely on most. We prefilled them from your materials so you can review instead of starting from scratch."
        actions={<Button>Save changes</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>Simple facts guests ask about every day.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2"><Label>Restaurant name</Label><Input defaultValue={profile.businessName} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Short description</Label><Textarea defaultValue={profile.businessDescription} placeholder="What kind of food and experience do you offer?" /></div>
            <div className="grid gap-2"><Label>Cuisine type</Label><Input defaultValue={profile.cuisineType} placeholder="For example: Mexican, Italian, brunch" /></div>
            <div className="grid gap-2"><Label>Phone</Label><Input defaultValue={profile.phone} placeholder="(555) 123-4567" /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Address</Label><Input defaultValue={profile.address} placeholder="Street address" /></div>
            <div className="grid gap-2"><Label>City</Label><Input defaultValue={profile.city} /></div>
            <div className="grid gap-2"><Label>State</Label><Input defaultValue={profile.state} /></div>
            <div className="grid gap-2"><Label>ZIP</Label><Input defaultValue={profile.zip} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input defaultValue={profile.email} placeholder="Optional" /></div>
            <div className="grid gap-2"><Label>Website</Label><Input defaultValue={profile.website} placeholder="https://..." /></div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regular hours</CardTitle>
              <CardDescription>We found your weekly schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.regularHours.length ? profile.regularHours.map((row) => (
                <div key={row.day} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                  <span>{row.day}</span>
                  <span className="text-muted-foreground">{row.open} - {row.close}</span>
                </div>
              )) : <div className="rounded-2xl border p-4 text-muted-foreground">No hours added yet.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Guest services</CardTitle>
              <CardDescription>Reservation, takeout, and catering preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">Reservations</div>
                <p>{profile.reservationInstructions || "Not set yet"}</p>
              </div>
              <div>
                <div className="font-medium text-foreground">Takeout</div>
                <p>{profile.takeoutInstructions || "Not set yet"}</p>
              </div>
              <div>
                <div className="font-medium text-foreground">Catering</div>
                <p>{profile.cateringInstructions || "Not set yet"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}