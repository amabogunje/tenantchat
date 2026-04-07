import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { ConfidenceBadge } from "@/components/feedback/confidence-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function CustomerQuestionsPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Questions"
        title="Build trust in what your assistant says"
        description="Review the answers guests are most likely to hear, see how confident the system is, and override anything that should sound different or escalate faster."
        actions={<Button>Add FAQ</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Common customer questions</CardTitle>
          <CardDescription>Each answer shows confidence and source references so you can understand what the assistant is relying on.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.faqs.map((faq) => (
            <div key={faq.id} className="rounded-[1.5rem] border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="font-medium">{faq.question}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                <ConfidenceBadge confidence={faq.confidence} />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Sources: {faq.sourceRefs.join(", ")}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm">Edit answer</Button>
                <Button variant="outline" size="sm">Flag for escalation</Button>
                <Button variant="outline" size="sm">Override reply</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suggested additions from real conversations</CardTitle>
          <CardDescription>The system keeps looking for gaps so your assistant improves over time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspace.learningSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-2xl border p-4">
              <div className="font-medium">{suggestion.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{suggestion.description}</div>
              <div className="mt-3 text-xs text-muted-foreground">Frequency: {suggestion.frequency} recent mentions</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
