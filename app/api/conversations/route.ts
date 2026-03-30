import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const conversations = await prisma.conversation.findMany({
      where: { tenantId },
      include: { customer: true, messages: { orderBy: { createdAt: "asc" } }, escalations: true },
      orderBy: { updatedAt: "desc" },
    });
    return ok({ conversations });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load conversations", 401);
  }
}
