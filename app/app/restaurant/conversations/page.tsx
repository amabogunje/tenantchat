import { redirect } from "next/navigation";
import { ConversationList } from "@/components/lists/conversation-list";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantAdminContext } from "@/lib/auth/session";
import { getVerticalWorkspaceData } from "@/lib/services/vertical-workspace";

export default async function RestaurantConversationsPage() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-in");
  const workspace = getVerticalWorkspaceData(tenant);
  if (!workspace) redirect("/app");

  if (workspace.mode === "starter") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Conversations"
          title="Guest conversations will appear here"
          description="Once your assistant is live and connected, you will be able to monitor what it answered, where confidence was low, and what guests keep asking about."
        />
        <Card>
          <CardHeader>
            <CardTitle>What this page will help you do</CardTitle>
            <CardDescription>Simple monitoring, not support-ops overload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>See recent customer messages</div>
            <div>Spot low-confidence answers</div>
            <div>See what escalated to a human</div>
            <div>Turn repeated questions into better FAQs</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conversations"
        title="See what your assistant is doing"
        description="Monitor recent conversations, spot low-confidence moments, and turn repeated questions into better answers."
      />
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <ConversationList conversations={workspace.conversations} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning loop</CardTitle>
              <CardDescription>What recent chats suggest you should add or clarify.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.learningSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="rounded-2xl border p-4">
                  <div className="font-medium">{suggestion.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{suggestion.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
