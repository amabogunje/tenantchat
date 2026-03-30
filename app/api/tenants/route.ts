import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createTenantForUser } from "@/lib/services/tenant";
import { ok, failure } from "@/lib/services/http";
import { tenantSchema } from "@/lib/services/schemas";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = tenantSchema.parse(await request.json());
    const tenant = await createTenantForUser({ userId: user.id, ...body });
    return ok({ tenant });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to create tenant");
  }
}
