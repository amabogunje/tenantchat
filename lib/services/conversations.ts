import { ConversationStatus, MessageDirection } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { answerCustomerQuestion, classifyIntent, summarizeEscalation } from "@/lib/llm/service";
import { sendWhatsAppMessage } from "@/lib/messaging/twilio";
import { retrieveTenantKnowledge } from "@/lib/retrieval";

export async function handleInboundMessage(input: { to: string; from: string; body: string; providerMessageId?: string }) {
  const channel = await prisma.channelConnection.findFirst({
    where: { externalNumber: input.to, provider: "TWILIO" },
    include: { tenant: true },
  });
  if (!channel) throw new Error("Channel not found");

  const customer = await prisma.customer.upsert({
    where: { tenantId_phone: { tenantId: channel.tenantId, phone: input.from } },
    update: {},
    create: { tenantId: channel.tenantId, phone: input.from },
  });

  const conversation =
    (await prisma.conversation.findFirst({
      where: { tenantId: channel.tenantId, customerId: customer.id, status: { in: ["OPEN", "ESCALATED"] } },
      orderBy: { updatedAt: "desc" },
    })) ||
    (await prisma.conversation.create({
      data: { tenantId: channel.tenantId, customerId: customer.id, channelConnectionId: channel.id, status: "OPEN" },
    }));

  await prisma.message.create({
    data: { conversationId: conversation.id, direction: MessageDirection.INBOUND, content: input.body, providerMessageId: input.providerMessageId },
  });

  const intent = await classifyIntent(input.body);
  await prisma.intentLog.create({
    data: {
      tenantId: channel.tenantId,
      conversationId: conversation.id,
      messageText: input.body,
      predictedIntent: intent.intent,
      confidence: intent.confidence,
      metadataJson: { rationale: intent.rationale },
    },
  });

  const knowledge = await retrieveTenantKnowledge(channel.tenantId, input.body);
  const structuredFacts = [
    knowledge.profile?.businessName ? `Business: ${knowledge.profile.businessName}` : "",
    knowledge.profile?.description ? `Description: ${knowledge.profile.description}` : "",
    knowledge.profile?.phone ? `Phone: ${knowledge.profile.phone}` : "",
    knowledge.profile?.address ? `Address: ${knowledge.profile.address}` : "",
    knowledge.profile?.hoursJson ? `Hours: ${JSON.stringify(knowledge.profile.hoursJson)}` : "",
    ...knowledge.offerings.map((offering) => `Offering: ${offering.name}${offering.description ? ` - ${offering.description}` : ""}`),
    ...knowledge.policies.map((policy) => `Policy: ${policy.title} - ${policy.body}`),
  ].filter(Boolean);

  if (intent.intent === "ask_human") {
    return escalateConversation(conversation.id, "Customer requested a human", true);
  }

  const answer = await answerCustomerQuestion({
    tenantName: channel.tenant.name,
    toneInstructions: knowledge.profile?.toneInstructions,
    customerMessage: input.body,
    structuredFacts,
    faqs: knowledge.faqs.map((faq) => `${faq.question}: ${faq.answer}`),
    chunks: knowledge.chunks.map((chunk) => chunk.chunkText),
  });

  if (answer.needsEscalation || answer.confidence < 0.45) {
    return escalateConversation(conversation.id, "Low confidence response", true);
  }

  const text = answer.needsClarification && answer.clarificationQuestion ? answer.clarificationQuestion : answer.answer;
  await prisma.message.create({ data: { conversationId: conversation.id, direction: MessageDirection.OUTBOUND, content: text } });
  await sendWhatsAppMessage(channel.id, customer.phone, text);
  return { conversationId: conversation.id, text, escalated: false };
}

export async function escalateConversation(conversationId: string, reason: string, notifyCustomer = false) {
  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.ESCALATED },
    include: { tenant: { include: { escalationRules: true } }, messages: { orderBy: { createdAt: "asc" } }, customer: true, channelConnection: true },
  });
  const summary = await summarizeEscalation(conversation.messages.map((message) => `${message.direction}: ${message.content}`).join("\n"));
  await prisma.escalationEvent.create({ data: { conversationId, reason: summary.reason || reason, summary: summary.summary } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { summary: summary.summary } });

  const acknowledgement = conversation.tenant.escalationRules[0]?.acknowledgementMsg || "Thanks, a human will follow up shortly.";
  if (notifyCustomer) {
    await prisma.message.create({ data: { conversationId, direction: MessageDirection.OUTBOUND, content: acknowledgement } });
    await sendWhatsAppMessage(conversation.channelConnectionId, conversation.customer.phone, acknowledgement);
  }

  return { conversationId, text: acknowledgement, escalated: true };
}
