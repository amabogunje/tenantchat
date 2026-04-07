import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/feedback/confidence-badge";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function MenuPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Menu and Services"
        title="A scan-friendly view of what guests can order"
        description="Review categories, prices, dietary tags, takeout availability, and catering packages in one place."
        actions={<Button>Save menu changes</Button>}
      />
      <section className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>We found {workspace.menuItems.length} core items from your uploaded materials. Edit what you need, then move on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.menuCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Button variant="outline" size="sm">Add item</Button>
                </div>
                {workspace.menuItems.filter((item) => item.categoryId === category.id).map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium">{item.name}</div>
                          {item.soldOutToday ? <Badge variant="warning">Sold out today</Badge> : null}
                          {item.seasonal ? <Badge>Seasonal</Badge> : null}
                          {!item.available ? <Badge variant="destructive">Unavailable</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {item.dietaryTags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1">{tag}</span>)}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">Sources: {item.sourceRefs.join(", ")}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">${item.price.toFixed(2)}</div>
                        <div className="mt-2"><ConfidenceBadge confidence={item.confidence} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catering packages</CardTitle>
              <CardDescription>Structured packages for catering inquiries and requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.cateringPackages.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ConfidenceBadge confidence={item.confidence} />
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">Starting at ${item.basePrice} | {item.pricingModel} | {item.minGuests}-{item.maxGuests} guests</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick availability controls</CardTitle>
              <CardDescription>Small changes that should reflect in WhatsApp right away.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>Mark an item unavailable</div>
              <div>Set a sold out item for today</div>
              <div>Disable takeout on a busy day</div>
              <div>Pause a catering package for a specific date</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
