import { ConversationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getDashboardData(tenantId: string) {
  const [tenant, profile, sources, faqs, offerings, conversations, escalations, intents] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.businessProfile.findFirst({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.sourceDocument.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.fAQ.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.offering.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.conversation.findMany({ where: { tenantId }, include: { customer: true, messages: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.escalationEvent.findMany({ where: { conversation: { tenantId } }, include: { conversation: { include: { customer: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.intentLog.groupBy({ by: ["predictedIntent"], where: { tenantId }, _count: { predictedIntent: true } }),
  ]);

  const totalConversations = conversations.length;
  const escalated = conversations.filter((conversation) => conversation.status === ConversationStatus.ESCALATED).length;
  const answeredByBot = conversations.filter((conversation) => conversation.messages.some((message) => message.direction === "OUTBOUND")).length;
  const unresolved = conversations.filter((conversation) => conversation.status !== ConversationStatus.CLOSED).length;

  return {
    tenant,
    profile,
    sources,
    faqs,
    offerings,
    conversations,
    escalations,
    analytics: {
      totalConversations,
      answeredByBot,
      escalated,
      unresolved,
      topIntents: intents.map((intent) => ({ intent: intent.predictedIntent, count: intent._count.predictedIntent })),
    },
  };
}
