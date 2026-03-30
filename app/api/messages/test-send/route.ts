import { requireTenantIdFromSession } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppMessage } from "@/lib/messaging/twilio";
import { ok, failure } from "@/lib/services/http";

export async function POST(request: Request) {
  try {
    const tenantId = await requireTenantIdFromSession();
    const { to, body } = await request.json();
    const channel = await prisma.channelConnection.findFirst({ where: { tenantId } });
    if (!channel) return failure("No channel configured", 404);
    const result = await sendWhatsAppMessage(channel.id, String(to), String(body));
    return ok({ result });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Unable to send test message");
  }
}
