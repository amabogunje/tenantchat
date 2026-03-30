import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { escalateConversation } from "@/lib/services/conversations";
import { ok, failure } from "@/lib/services/http";
import { escalationSchema } from "@/lib/services/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const { id } = await params;
    const existing = await prisma.conversation.findFirst({ where: { id, tenantId } });
    if (!existing) return failure("Conversation not found", 404);
    const body = escalationSchema.parse(await request.json());
    const result = await escalateConversation(id, body.reason, false);
    return ok(result);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to escalate conversation");
  }
}
