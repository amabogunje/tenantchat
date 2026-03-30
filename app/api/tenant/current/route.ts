import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { ok, failure } from "@/lib/services/http";
import { profileSchema } from "@/lib/services/schemas";
import { updateTenantProfile } from "@/lib/services/tenant";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const [tenant, profile, channel] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.businessProfile.findFirst({ where: { tenantId } }),
      prisma.channelConnection.findFirst({ where: { tenantId } }),
    ]);
    return ok({ tenant, profile, channel });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load tenant", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = profileSchema.parse(await request.json());
    const profile = await updateTenantProfile(tenantId, body);
    return ok({ profile });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to update tenant");
  }
}
