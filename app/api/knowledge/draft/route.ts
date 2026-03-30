import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const [profile, artifacts, faqs, offerings, policies] = await Promise.all([
      prisma.businessProfile.findFirst({ where: { tenantId } }),
      prisma.extractedArtifact.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } }),
      prisma.fAQ.findMany({ where: { tenantId } }),
      prisma.offering.findMany({ where: { tenantId } }),
      prisma.policy.findMany({ where: { tenantId } }),
    ]);
    return ok({ profile, artifacts, faqs, offerings, policies });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load knowledge", 401);
  }
}
