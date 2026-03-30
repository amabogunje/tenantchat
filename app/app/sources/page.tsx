import { addTextSourceAction, addWebsiteSourceAction, processSourceAction } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function SourcesPage() {
  const { tenant } = await getCurrentTenantContext();
  const sources = tenant ? await prisma.sourceDocument.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } }) : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add website source</CardTitle>
            <CardDescription>Queue a public site URL for extraction and review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addWebsiteSourceAction} className="space-y-4">
              <div className="grid gap-2"><Label htmlFor="url">Website URL</Label><Input id="url" name="url" placeholder="https://example.com" /></div>
              <Button type="submit">Add website</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add manual text or PDF transcript</CardTitle>
            <CardDescription>Use this MVP input to simulate PDF, menu, flyer, or service-list ingestion.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addTextSourceAction} className="space-y-4">
              <div className="grid gap-2"><Label htmlFor="originalName">Source name</Label><Input id="originalName" name="originalName" placeholder="menu.pdf" /></div>
              <div className="grid gap-2"><Label htmlFor="sourceType">Source type</Label><select id="sourceType" name="sourceType" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="TEXT">Text</option><option value="PDF">PDF</option><option value="IMAGE">Image</option></select></div>
              <div className="grid gap-2"><Label htmlFor="extractedText">Extracted text</Label><Textarea id="extractedText" name="extractedText" placeholder="Paste website copy, menu text, service list, or PDF contents here." /></div>
              <Button type="submit">Save source</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Queued sources</CardTitle>
          <CardDescription>Run processing to turn raw source text into draft knowledge artifacts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-medium">{source.originalName}</div>
                <div className="text-sm text-muted-foreground">{source.sourceType} � {source.ingestionStatus}</div>
              </div>
              <form action={processSourceAction}>
                <input type="hidden" name="sourceId" value={source.id} />
                <Button type="submit" variant="outline">Process source</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
