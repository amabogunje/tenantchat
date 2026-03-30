import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { processSource } from "@/lib/services/sources";
import { extractWebsiteText } from "@/lib/ingestion/extract";
import { ok, failure } from "@/lib/services/http";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const { id } = await params;
    const source = await prisma.sourceDocument.findFirst({ where: { id, tenantId } });
    if (!source) return failure("Source not found", 404);
    if (source.sourceType === "WEBSITE" && source.sourceUrl) {
      const extractedText = await extractWebsiteText(source.sourceUrl);
      await prisma.sourceDocument.update({ where: { id }, data: { extractedText } });
    }
    const extraction = await processSource(id);
    return ok({ extraction });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to process source");
  }
}
