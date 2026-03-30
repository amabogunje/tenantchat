"use server";

import { redirect } from "next/navigation";
import { IndustryType, SourceType } from "@prisma/client";
import { getCurrentTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { decryptSecret } from "@/lib/security/crypto";
import { validateTwilioCredentials } from "@/lib/messaging/twilio";
import { createTextSource, createWebsiteSource, processSource, publishKnowledge } from "@/lib/services/sources";
import { escalateConversation } from "@/lib/services/conversations";
import { updateTenantProfile, upsertChannelConnection } from "@/lib/services/tenant";

export async function saveOnboarding(formData: FormData) {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  await updateTenantProfile(tenant.id, {
    tenantName: String(formData.get("tenantName") || tenant.name),
    industryType: String(formData.get("industryType") || tenant.industryType) as IndustryType,
    businessName: String(formData.get("businessName") || tenant.name),
    description: String(formData.get("description") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    website: String(formData.get("website") || ""),
    address: String(formData.get("address") || ""),
    toneInstructions: String(formData.get("toneInstructions") || "Helpful, concise, and honest."),
    hoursJson: {
      Monday: String(formData.get("hoursMonday") || ""),
      Tuesday: String(formData.get("hoursTuesday") || ""),
      Wednesday: String(formData.get("hoursWednesday") || ""),
      Thursday: String(formData.get("hoursThursday") || ""),
      Friday: String(formData.get("hoursFriday") || ""),
      Saturday: String(formData.get("hoursSaturday") || ""),
      Sunday: String(formData.get("hoursSunday") || ""),
    },
  });
  redirect("/app/settings");
}

export async function saveChannel(formData: FormData) {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");

  const existingChannel = await prisma.channelConnection.findFirst({
    where: { tenantId: tenant.id, provider: "TWILIO" },
    orderBy: { updatedAt: "desc" },
  });

  const existingAuthToken = existingChannel ? decryptSecret(existingChannel.authTokenEncrypted) : "";
  const existingWebhookSecret = existingChannel?.webhookSecretEncrypted ? decryptSecret(existingChannel.webhookSecretEncrypted) : "";

  await upsertChannelConnection(tenant.id, {
    externalNumber: String(formData.get("externalNumber") || existingChannel?.externalNumber || ""),
    accountSid: String(formData.get("accountSid") || existingChannel?.accountSid || process.env.TWILIO_ACCOUNT_SID || "sandbox"),
    authToken: String(formData.get("authToken") || existingAuthToken || process.env.TWILIO_AUTH_TOKEN || "sandbox"),
    webhookSecret: String(formData.get("webhookSecret") || existingWebhookSecret || ""),
  });
  redirect("/app/channel");
}

export async function validateChannelCredentials() {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  const result = await validateTwilioCredentials(tenant.id);
  const status = result.ok ? "success" : "error";
  redirect(`/app/channel?validation=${status}&message=${encodeURIComponent(result.message)}`);
}

export async function addWebsiteSourceAction(formData: FormData) {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  await createWebsiteSource(tenant.id, String(formData.get("url") || ""));
  redirect("/app/sources");
}

export async function addTextSourceAction(formData: FormData) {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  await createTextSource(
    tenant.id,
    String(formData.get("originalName") || "Manual note"),
    String(formData.get("extractedText") || ""),
    String(formData.get("sourceType") || SourceType.TEXT) as SourceType,
  );
  redirect("/app/sources");
}

export async function processSourceAction(formData: FormData) {
  const sourceId = String(formData.get("sourceId") || "");
  await processSource(sourceId);
  redirect("/app/knowledge");
}

export async function publishKnowledgeAction() {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  await publishKnowledge(tenant.id);
  redirect("/app/knowledge");
}

export async function updateEscalationContact(formData: FormData) {
  const { tenant } = await getCurrentTenantContext();
  if (!tenant) redirect("/sign-up");
  await prisma.escalationRule.upsert({
    where: { tenantId: tenant.id },
    update: {
      contactLabel: String(formData.get("contactLabel") || "Owner"),
      contactValue: String(formData.get("contactValue") || ""),
      acknowledgementMsg: String(formData.get("acknowledgementMsg") || "Thanks, a human will follow up shortly."),
    },
    create: {
      tenantId: tenant.id,
      contactLabel: String(formData.get("contactLabel") || "Owner"),
      contactValue: String(formData.get("contactValue") || ""),
      acknowledgementMsg: String(formData.get("acknowledgementMsg") || "Thanks, a human will follow up shortly."),
    },
  });
  redirect("/app/settings");
}

export async function manualEscalateAction(formData: FormData) {
  await escalateConversation(String(formData.get("conversationId") || ""), String(formData.get("reason") || "Manual admin escalation"), false);
  redirect("/app/escalations");
}
