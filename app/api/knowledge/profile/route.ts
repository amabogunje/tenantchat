import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { updateTenantProfile } from "@/lib/services/tenant";
import { ok, failure } from "@/lib/services/http";
import { profileSchema } from "@/lib/services/schemas";

export async function PATCH(request: Request) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = profileSchema.parse(await request.json());
    const profile = await updateTenantProfile(tenantId, body);
    return ok({ profile });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to update profile");
  }
}
