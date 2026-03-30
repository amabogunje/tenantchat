import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { publishKnowledge } from "@/lib/services/sources";
import { ok, failure } from "@/lib/services/http";

export async function POST() {
  try {
    const tenantId = await requireTenantIdFromSession();
    await publishKnowledge(tenantId);
    return ok({ success: true });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to publish knowledge");
  }
}
