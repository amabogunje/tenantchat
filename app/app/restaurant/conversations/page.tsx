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
          <Card>
            <CardHeader>
              <CardTitle>Intent coverage</CardTitle>
              <CardDescription>Restaurant-specific interactions the assistant is expected to handle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Reservations</div>
              <div>Takeout ordering</div>
              <div>Catering inquiries</div>
              <div>Hours, location, and menu questions</div>
              <div>Dietary guidance and escalation requests</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
