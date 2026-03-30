import twilio from "twilio";
import { prisma } from "@/lib/db/prisma";
import { decryptSecret } from "@/lib/security/crypto";

export async function getTwilioConfig(channelConnectionId: string) {
  const connection = await prisma.channelConnection.findUnique({ where: { id: channelConnectionId } });
  if (!connection) throw new Error("Channel connection not found");
  return {
    id: connection.id,
    from: connection.externalNumber,
    accountSid: connection.accountSid,
    authToken: decryptSecret(connection.authTokenEncrypted),
  };
}

export async function getTenantTwilioConfig(tenantId: string) {
  const connection = await prisma.channelConnection.findFirst({
    where: { tenantId, provider: "TWILIO" },
    orderBy: { updatedAt: "desc" },
  });
  if (!connection) return null;
  return {
    id: connection.id,
    from: connection.externalNumber,
    accountSid: connection.accountSid,
    authToken: decryptSecret(connection.authTokenEncrypted),
  };
}

export async function validateTwilioCredentials(tenantId: string) {
  const config = await getTenantTwilioConfig(tenantId);
  if (!config) {
    return { ok: false, message: "No Twilio channel has been saved for this tenant yet." };
  }
  if (!config.accountSid || !config.authToken) {
    return { ok: false, message: "Account SID or auth token is missing." };
  }

  try {
    const client = twilio(config.accountSid, config.authToken);
    const account = await client.api.accounts(config.accountSid).fetch();
    return {
      ok: true,
      message: `Authenticated successfully for account ${account.sid}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Twilio validation error";
    return { ok: false, message };
  }
}

export async function sendWhatsAppMessage(channelConnectionId: string, to: string, body: string) {
  const config = await getTwilioConfig(channelConnectionId);
  if (!config.accountSid || !config.authToken) {
    return { sid: "stubbed", status: "queued" };
  }
  const client = twilio(config.accountSid, config.authToken);
  return client.messages.create({
    from: config.from,
    to,
    body,
  });
}
