import { manualEscalateAction } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ConversationsPage() {
  const { tenant } = await getCurrentTenantContext();
  const conversations = tenant ? await prisma.conversation.findMany({ where: { tenantId: tenant.id }, include: { customer: true, messages: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" } }) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
        <CardDescription>Inbound and outbound messages are logged per tenant and per customer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="rounded-2xl border p-5">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-medium">{conversation.customer.phone}</div>
                <div className="text-sm text-muted-foreground">Status: {conversation.status}</div>
              </div>
              <form action={manualEscalateAction} className="flex gap-2">
                <input type="hidden" name="conversationId" value={conversation.id} />
                <input type="hidden" name="reason" value="Manual escalation from admin dashboard" />
                <Button type="submit" variant="outline">Escalate</Button>
              </form>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {conversation.messages.map((message) => (
                <div key={message.id} className="rounded-xl bg-muted px-3 py-2">
                  <span className="font-medium">{message.direction}:</span> {message.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
