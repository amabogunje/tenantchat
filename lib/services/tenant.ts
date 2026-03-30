import { BusinessProfile, IndustryType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { encryptSecret } from "@/lib/security/crypto";

function toInputJson(value: BusinessProfile["hoursJson"] | undefined) {
  if (value === null || value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

export async function createTenantForUser(input: { userId: string; name: string; industryType: IndustryType; description?: string }) {
  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      slug: slugify(input.name),
      industryType: input.industryType,
      status: "DRAFT",
      members: { create: { userId: input.userId, role: "owner" } },
      businessProfiles: {
        create: {
          businessName: input.name,
          description: input.description || "",
        },
      },
      escalationRules: {
        create: {
          contactLabel: "Owner",
          contactValue: "Update in settings",
          acknowledgementMsg: "Thanks, we have escalated your conversation to a human.",
        },
      },
    },
  });
  return tenant;
}

export async function updateTenantProfile(tenantId: string, payload: Partial<BusinessProfile> & { industryType?: IndustryType; tenantName?: string }) {
  if (payload.tenantName || payload.industryType) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: payload.tenantName,
        slug: payload.tenantName ? slugify(payload.tenantName) : undefined,
        industryType: payload.industryType,
      },
    });
  }

  return prisma.businessProfile.upsert({
    where: { tenantId },
    update: {
      businessName: payload.businessName,
      description: payload.description,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      address: payload.address,
      hoursJson: toInputJson(payload.hoursJson),
      toneInstructions: payload.toneInstructions,
    },
    create: {
      tenantId,
      businessName: payload.businessName || payload.tenantName || "Tenant",
      description: payload.description,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      address: payload.address,
      hoursJson: toInputJson(payload.hoursJson),
      toneInstructions: payload.toneInstructions,
    },
  });
}

export async function upsertChannelConnection(tenantId: string, payload: { externalNumber: string; accountSid: string; authToken: string; webhookSecret?: string }) {
  return prisma.channelConnection.upsert({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "TWILIO",
      },
    },
    update: {
      externalNumber: payload.externalNumber,
      accountSid: payload.accountSid,
      authTokenEncrypted: payload.authToken ? encryptSecret(payload.authToken) : undefined,
      webhookSecretEncrypted: payload.webhookSecret ? encryptSecret(payload.webhookSecret) : undefined,
      status: "CONNECTED",
    },
    create: {
      tenantId,
      provider: "TWILIO",
      externalNumber: payload.externalNumber,
      accountSid: payload.accountSid,
      authTokenEncrypted: encryptSecret(payload.authToken),
      webhookSecretEncrypted: payload.webhookSecret ? encryptSecret(payload.webhookSecret) : undefined,
      status: "CONNECTED",
    },
  });
}
