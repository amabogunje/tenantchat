import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const sources = await prisma.sourceDocument.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    return ok({ sources });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load sources", 401);
  }
}
