import { ConfidenceBadge } from "@/components/feedback/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RestaurantConversation } from "@/verticals/restaurant";

export function ConversationList({ conversations }: { conversations: RestaurantConversation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent conversations</CardTitle>
        <CardDescription>See what guests asked, how the assistant responded, and where confidence dropped.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="rounded-[1.5rem] border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium">{conversation.customerName}</div>
                  <Badge variant={conversation.status === "answered" ? "success" : conversation.status === "escalated" ? "warning" : "default"}>{conversation.status}</Badge>
                  <Badge>{conversation.detectedIntent.replace(/_/g, " ")}</Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{conversation.customerMessage}</div>
              </div>
              <ConfidenceBadge confidence={conversation.confidence} />
            </div>
            <div className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm text-foreground">{conversation.assistantReply}</div>
            <div className="mt-3 text-xs text-muted-foreground">Sources: {conversation.sourceRefs.join(", ")}</div>
            {conversation.escalationReason ? <div className="mt-2 text-xs text-muted-foreground">Escalation reason: {conversation.escalationReason}</div> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
