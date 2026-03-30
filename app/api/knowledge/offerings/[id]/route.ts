import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";
import { updateOfferingSchema } from "@/lib/services/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = updateOfferingSchema.parse(await request.json());
    const { id } = await params;
    const existing = await prisma.offering.findFirst({ where: { id, tenantId } });
    if (!existing) return failure("Offering not found", 404);
    const offering = await prisma.offering.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        basePrice: body.basePrice,
        durationMinutes: body.durationMinutes,
        published: body.published ?? true,
      },
    });
    return ok({ offering });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to update offering");
  }
}
