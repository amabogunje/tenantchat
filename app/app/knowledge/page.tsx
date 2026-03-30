import { publishKnowledgeAction } from "@/components/forms/tenant-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function KnowledgePage() {
  const { tenant } = await getCurrentTenantContext();
  const [profile, artifacts, faqs, offerings, policies] = tenant ? await Promise.all([
    prisma.businessProfile.findFirst({ where: { tenantId: tenant.id } }),
    prisma.extractedArtifact.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } }),
    prisma.fAQ.findMany({ where: { tenantId: tenant.id } }),
    prisma.offering.findMany({ where: { tenantId: tenant.id } }),
    prisma.policy.findMany({ where: { tenantId: tenant.id } }),
  ]) : [null, [], [], [], []];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge review</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review extracted artifacts and publish approved knowledge for runtime answers.</p>
        </div>
        <form action={publishKnowledgeAction}><Button type="submit">Publish knowledge</Button></form>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Business profile</CardTitle><CardDescription>Runtime uses only published profile data.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Business:</span> {profile?.businessName || tenant?.name}</p>
            <p><span className="font-medium text-foreground">Description:</span> {profile?.description || "No description yet."}</p>
            <p><span className="font-medium text-foreground">Published:</span> {profile?.isPublished ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Draft artifacts</CardTitle><CardDescription>Artifacts store extraction confidence before publish.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {artifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{artifact.artifactType}</span>
                  <Badge variant={artifact.status === "PUBLISHED" ? "success" : "warning"}>{artifact.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Confidence: {artifact.confidence?.toFixed(2) || "n/a"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card><CardHeader><CardTitle>Offerings</CardTitle></CardHeader><CardContent className="space-y-3">{offerings.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="font-medium">{item.name}</div><div className="text-sm text-muted-foreground">{item.description || "No description"}</div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>FAQs</CardTitle></CardHeader><CardContent className="space-y-3">{faqs.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="font-medium">{item.question}</div><div className="text-sm text-muted-foreground">{item.answer}</div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Policies</CardTitle></CardHeader><CardContent className="space-y-3">{policies.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="font-medium">{item.title}</div><div className="text-sm text-muted-foreground">{item.body}</div></div>)}</CardContent></Card>
      </div>
    </div>
  );
}
