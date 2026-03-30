import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { getDashboardData } from "@/lib/services/dashboard";
import { ok, failure } from "@/lib/services/http";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const data = await getDashboardData(tenantId);
    return ok({ analytics: data.analytics });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load analytics", 401);
  }
}
