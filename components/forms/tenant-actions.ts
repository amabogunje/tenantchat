"use server";

import { Buffer } from "node:buffer";
import { redirect } from "next/navigation";
import { IndustryType, SourceType } from "@prisma/client";
import { requireSystemAdmin, requireTenantAdminContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { extractDocumentText } from "@/lib/ingestion/extract";
import { extractImageText } from "@/lib/llm/service";
import { validateTwilioCredentials } from "@/lib/messaging/twilio";
import { decryptSecret } from "@/lib/security/crypto";
import { escalateConversation } from "@/lib/services/conversations";
import { createTextSource, createWebsiteSource, processSource, publishKnowledge } from "@/lib/services/sources";
import { updateTenantProfile, upsertChannelConnection } from "@/lib/services/tenant";

export async function saveOnboarding(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
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
  redirect("/app/restaurant/profile");
}

export async function saveManagedChannel(formData: FormData) {
  await requireSystemAdmin();
  const tenantId = String(formData.get("tenantId") || "");
  if (!tenantId) redirect("/admin/tenants");

  const existingChannel = await prisma.channelConnection.findFirst({
    where: { tenantId, provider: "TWILIO" },
    orderBy: { updatedAt: "desc" },
  });

  const existingAuthToken = existingChannel ? decryptSecret(existingChannel.authTokenEncrypted) : "";
  const existingWebhookSecret = existingChannel?.webhookSecretEncrypted ? decryptSecret(existingChannel.webhookSecretEncrypted) : "";

  await upsertChannelConnection(tenantId, {
    externalNumber: String(formData.get("externalNumber") || existingChannel?.externalNumber || ""),
    accountSid: String(formData.get("accountSid") || existingChannel?.accountSid || ""),
    authToken: String(formData.get("authToken") || existingAuthToken || ""),
    webhookSecret: String(formData.get("webhookSecret") || existingWebhookSecret || ""),
  });

  redirect(`/admin/tenants/${tenantId}`);
}

export async function validateManagedChannelCredentials(formData: FormData) {
  await requireSystemAdmin();
  const tenantId = String(formData.get("tenantId") || "");
  if (!tenantId) redirect("/admin/tenants");

  const result = await validateTwilioCredentials(tenantId);
  const status = result.ok ? "success" : "error";
  redirect(`/admin/tenants/${tenantId}?validation=${status}&message=${encodeURIComponent(result.message)}`);
}

export async function addWebsiteSourceAction(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-up");
  await createWebsiteSource(tenant.id, String(formData.get("url") || ""));
  redirect("/app/restaurant/setup");
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && value !== null && "size" in value && "name" in value && typeof (value as File).size === "number";
}

function inferSourceType(filename: string, mimeType: string) {
  const name = filename.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|svg)$/.test(name)) {
    return SourceType.IMAGE;
  }

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return SourceType.PDF;
  }

  return SourceType.TEXT;
}

export async function saveSetupLinksAction(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-up");

  const rawLinks = formData
    .getAll("links")
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const normalizedLinks = Array.from(new Set(rawLinks.map((value) => (value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`))));

  const existingUrls = new Set(
    (
      await prisma.sourceDocument.findMany({
        where: { tenantId: tenant.id, sourceType: SourceType.WEBSITE },
        select: { sourceUrl: true },
      })
    )
      .map((item) => item.sourceUrl)
      .filter((value): value is string => Boolean(value)),
  );

  for (const url of normalizedLinks) {
    if (existingUrls.has(url)) continue;
    const source = await createWebsiteSource(tenant.id, url);
    await processSource(source.id);
  }

  redirect("/app/restaurant/onboarding/documents");
}

export async function uploadSetupDocumentsAction(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-up");

  const files = formData.getAll("files").filter((value): value is File => isUploadedFile(value) && value.size > 0);

  if (!files.length) {
    redirect("/app/restaurant/onboarding/documents");
  }

  for (const file of files) {
    const sourceType = inferSourceType(file.name, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (sourceType === SourceType.IMAGE) {
      let extractedText = "";

      try {
        extractedText = await extractImageText({
          buffer,
          mimeType: file.type || "image/jpeg",
          filename: file.name,
        });
      } catch {
        extractedText = "";
      }

      if (extractedText) {
        const source = await createTextSource(tenant.id, file.name, extractedText, sourceType);
        await processSource(source.id);
      } else {
        await prisma.sourceDocument.create({
          data: {
            tenantId: tenant.id,
            sourceType,
            originalName: file.name,
            extractedText: `Image uploaded: ${file.name}. OCR could not confidently read this image, so manual review may still be needed.`,
            ingestionStatus: "NEEDS_REVIEW",
            metadataJson: { mimeType: file.type, size: file.size },
          },
        });
      }
      continue;
    }

    let extractedText = `${file.name}\n\nUploaded by the restaurant owner during setup. Use this file as supporting source material and flag it for review if details are unclear.`;

    try {
      const parsedText = await extractDocumentText({
        buffer,
        filename: file.name,
        mimeType: file.type,
        sourceType,
      });

      if (parsedText) {
        extractedText = parsedText;
      }
    } catch {
      // Keep the fallback text for documents we cannot deeply parse in MVP mode.
    }

    const source = await createTextSource(tenant.id, file.name, extractedText, sourceType);
    await processSource(source.id);
  }

  redirect("/app/restaurant/onboarding/review");
}

export async function addTextSourceAction(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-up");
  await createTextSource(
    tenant.id,
    String(formData.get("originalName") || "Manual note"),
    String(formData.get("extractedText") || ""),
    String(formData.get("sourceType") || SourceType.TEXT) as SourceType,
  );
  redirect("/app/restaurant/setup");
}

export async function processSourceAction(formData: FormData) {
  const sourceId = String(formData.get("sourceId") || "");
  await processSource(sourceId);
  redirect("/app/restaurant/setup");
}

export async function publishKnowledgeAction() {
  const { tenant } = await requireTenantAdminContext();
  if (!tenant) redirect("/sign-up");

  const pendingSources = await prisma.sourceDocument.findMany({
    where: { tenantId: tenant.id, ingestionStatus: "PENDING", sourceType: { in: [SourceType.WEBSITE, SourceType.PDF, SourceType.TEXT, SourceType.IMAGE] } },
    select: { id: true },
  });

  for (const source of pendingSources) {
    await processSource(source.id);
  }

  await publishKnowledge(tenant.id);
  redirect("/app/restaurant/overview");
}

export async function updateEscalationContact(formData: FormData) {
  const { tenant } = await requireTenantAdminContext();
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
  redirect("/app/restaurant/settings");
}

export async function manualEscalateAction(formData: FormData) {
  await escalateConversation(String(formData.get("conversationId") || ""), String(formData.get("reason") || "Manual admin escalation"), false);
  redirect("/app/restaurant/conversations");
}