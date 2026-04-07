import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantUpdatesPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Today's Updates"
        title={workspace.mode === "starter" ? "Quick changes will be easy here" : "Make quick daily changes without the hassle"}
        description={workspace.mode === "starter" ? "When your assistant is live, this is where you will quickly mark sold out items, changed hours, closures, and promotions." : "Busy nights happen. Mark sold out items, change hours, pause takeout, or post a special note in seconds."}
        actions={<Button>{workspace.mode === "starter" ? "Save changes later" : "Save today's changes"}</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fast actions</CardTitle>
            <CardDescription>Designed for speed during service.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start">Mark closed today</Button>
            <Button variant="outline" className="justify-start">Change today's hours</Button>
            <Button variant="outline" className="justify-start">Mark sold out item</Button>
            <Button variant="outline" className="justify-start">Disable takeout for today</Button>
            <Button variant="outline" className="justify-start">Disable catering for a date</Button>
            <Button variant="outline" className="justify-start">Post special note</Button>
            <Button variant="outline" className="justify-start">Add promotion</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{workspace.mode === "starter" ? "Nothing active yet" : "Active updates"}</CardTitle>
            <CardDescription>{workspace.mode === "starter" ? "Daily updates appear after you start using the assistant." : "What customers should hear right now."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.dailyUpdates.length ? workspace.dailyUpdates.map((update) => (
              <div key={update.id} className="rounded-[1.5rem] border p-4">
                <div className="font-medium">{update.message}</div>
                <div className="mt-1 text-sm text-muted-foreground">{update.type.replace(/_/g, " ")} | Effective {update.effectiveDate}</div>
              </div>
            )) : <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No daily updates yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
