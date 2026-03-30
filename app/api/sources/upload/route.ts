import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { createTextSource } from "@/lib/services/sources";
import { ok, failure } from "@/lib/services/http";
import { textSourceSchema } from "@/lib/services/schemas";

export async function POST(request: Request) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const body = textSourceSchema.parse(await request.json());
    const source = await createTextSource(tenantId, body.originalName, body.extractedText, body.sourceType);
    return ok({ source });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Upload failed");
  }
}
