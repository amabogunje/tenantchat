import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { createWebsiteSource } from "@/lib/services/sources";
import { ok, failure } from "@/lib/services/http";
import { websiteSourceSchema } from "@/lib/services/schemas";

export async function GET() {
  try {
    const tenantId = await requireTenantIdFromSession();
    const sources = await prisma.sourceDocument.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    return ok({ sources });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to load sources", 401);
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = websiteSourceSchema.parse(await request.json());
    const source = await createWebsiteSource(tenantId, body.url);
    return ok({ source });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to add website source");
  }
}
