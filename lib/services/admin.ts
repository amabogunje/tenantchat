import { prisma } from "@/lib/db/prisma";

export async function getSystemAdminDashboardData() {
  const [tenantCount, activeTenantCount, connectedChannels, openConversations, escalatedConversations, tenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.channelConnection.count({ where: { status: "CONNECTED" } }),
    prisma.conversation.count({ where: { status: "OPEN" } }),
    prisma.conversation.count({ where: { status: "ESCALATED" } }),
    prisma.tenant.findMany({
      include: {
        members: { include: { user: true } },
        channels: true,
        businessProfiles: true,
        _count: {
          select: {
            conversations: true,
            sourceDocuments: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  return {
    tenantCount,
    activeTenantCount,
    connectedChannels,
    openConversations,
    escalatedConversations,
    tenants,
    platform: {
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
      appBaseUrlConfigured: Boolean(process.env.APP_BASE_URL),
      encryptionConfigured: Boolean(process.env.ENCRYPTION_KEY),
    },
  };
}

export async function getManagedTenant(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      members: { include: { user: true } },
      channels: { orderBy: { updatedAt: "desc" } },
      businessProfiles: true,
      escalationRules: true,
      _count: {
        select: {
          conversations: true,
          sourceDocuments: true,
          offerings: true,
          faqs: true,
        },
      },
    },
  });
}
