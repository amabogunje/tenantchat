import { prisma } from "@/lib/db/prisma";
import { rankChunks, rankFaqs, rankOfferings, rankPolicies } from "@/lib/retrieval/lexical";

export async function retrieveTenantKnowledge(tenantId: string, query: string) {
  const [profile, faqs, offerings, policies, chunks] = await Promise.all([
    prisma.businessProfile.findFirst({
      where: { tenantId, isPublished: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.fAQ.findMany({ where: { tenantId, published: true } }),
    prisma.offering.findMany({ where: { tenantId, published: true } }),
    prisma.policy.findMany({ where: { tenantId, published: true } }),
    prisma.knowledgeChunk.findMany({ where: { tenantId, published: true } }),
  ]);

  return {
    profile,
    faqs: rankFaqs(query, faqs),
    offerings: rankOfferings(query, offerings),
    policies: rankPolicies(query, policies),
    chunks: rankChunks(query, chunks),
  };
}
