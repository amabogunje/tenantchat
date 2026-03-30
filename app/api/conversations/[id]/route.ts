import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const { id } = await params;
    const conversation = await prisma.conversation.findFirst({
      where: { id, tenantId },
      include: { customer: true, messages: { orderBy: { createdAt: "asc" } }, escalations: true },
    });
    if (!conversation) return failure("Conversation not found", 404);
    return ok({ conversation });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load conversation");
  }
}
