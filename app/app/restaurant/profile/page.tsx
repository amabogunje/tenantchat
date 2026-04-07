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
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");
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
            <CardDescription>Simple, structured facts for everyday customer questions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2"><Label>Restaurant name</Label><Input defaultValue={profile.businessName} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Short description</Label><Textarea defaultValue={profile.businessDescription} /></div>
            <div className="grid gap-2"><Label>Cuisine type</Label><Input defaultValue={profile.cuisineType} /></div>
            <div className="grid gap-2"><Label>Phone</Label><Input defaultValue={profile.phone} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Address</Label><Input defaultValue={profile.address} /></div>
            <div className="grid gap-2"><Label>City</Label><Input defaultValue={profile.city} /></div>
            <div className="grid gap-2"><Label>State</Label><Input defaultValue={profile.state} /></div>
            <div className="grid gap-2"><Label>ZIP</Label><Input defaultValue={profile.zip} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input defaultValue={profile.email} /></div>
            <div className="grid gap-2"><Label>Website</Label><Input defaultValue={profile.website} /></div>
            <div className="grid gap-2"><Label>Parking info</Label><Textarea defaultValue={profile.parkingInfo} /></div>
            <div className="grid gap-2"><Label>Service area</Label><Textarea defaultValue={profile.serviceArea} /></div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regular hours</CardTitle>
              <CardDescription>We found your weekly schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.regularHours.map((row) => (
                <div key={row.day} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                  <span>{row.day}</span>
                  <span className="text-muted-foreground">{row.open} - {row.close}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Holiday hours and closures</CardTitle>
              <CardDescription>Temporary schedule changes guests should trust.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {profile.holidayHours.map((row) => (
                <div key={row.date} className="rounded-2xl bg-muted/60 px-4 py-3">{row.label}: {row.hours}</div>
              ))}
              {profile.temporaryClosures.map((row) => (
                <div key={row.date} className="rounded-2xl bg-muted/60 px-4 py-3">Closed {row.date}: {row.reason}</div>
              ))}
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
                <p>{profile.reservationInstructions}</p>
              </div>
              <div>
                <div className="font-medium text-foreground">Takeout</div>
                <p>{profile.takeoutInstructions}</p>
              </div>
              <div>
                <div className="font-medium text-foreground">Catering</div>
                <p>{profile.cateringInstructions}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
