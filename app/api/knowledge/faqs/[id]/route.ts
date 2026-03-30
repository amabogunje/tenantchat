import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";
import { updateFaqSchema } from "@/lib/services/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = updateFaqSchema.parse(await request.json());
    const { id } = await params;
    const existing = await prisma.fAQ.findFirst({ where: { id, tenantId } });
    if (!existing) return failure("FAQ not found", 404);
    const faq = await prisma.fAQ.update({
      where: { id },
      data: { question: body.question, answer: body.answer, published: body.published ?? true },
    });
    return ok({ faq });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to update FAQ");
  }
}
