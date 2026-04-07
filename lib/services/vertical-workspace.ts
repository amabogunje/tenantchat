import type { Tenant } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import "@/verticals/restaurant";
import { buildDemoWorkspace, buildStarterWorkspace, demoTenantSlugs, type RestaurantWorkspaceData } from "@/verticals/restaurant/mock-data";
import { getVerticalConfig, resolveVerticalKey } from "@/verticals/shared/registry";

export function getTenantVertical(tenant: Tenant) {
  const key = resolveVerticalKey(tenant.industryType);
  if (!key) return null;
  return getVerticalConfig(key);
}

function mapSourceType(type: string) {
  return type.toLowerCase().replace(/_/g, " ");
}

function mapProcessingStatus(status: string): "processed" | "needs_review" | "processing" | "uploaded" {
  if (status === "COMPLETED") return "processed";
  if (status === "NEEDS_REVIEW") return "needs_review";
  if (status === "PROCESSING") return "processing";
  return "uploaded";
}

export async function getVerticalWorkspaceData(tenant: Tenant): Promise<RestaurantWorkspaceData | null> {
  const key = resolveVerticalKey(tenant.industryType);
  if (key !== "restaurant") return null;

  if (demoTenantSlugs.has(tenant.slug)) {
    return buildDemoWorkspace(tenant);
  }

  const [profile, sources, faqs, offerings, conversations, artifacts] = await Promise.all([
    prisma.businessProfile.findFirst({ where: { tenantId: tenant.id }, orderBy: { updatedAt: "desc" } }),
    prisma.sourceDocument.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "asc" } }),
    prisma.fAQ.findMany({ where: { tenantId: tenant.id, published: true }, orderBy: { updatedAt: "desc" } }),
    prisma.offering.findMany({ where: { tenantId: tenant.id, published: true }, orderBy: { updatedAt: "desc" } }),
    prisma.conversation.findMany({ where: { tenantId: tenant.id }, include: { customer: true, messages: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.extractedArtifact.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  const starter = buildStarterWorkspace(tenant);
  const uploadedArtifacts = sources.map((source) => ({
    id: source.id,
    tenantId: tenant.id,
    type: mapSourceType(source.sourceType),
    filename: source.originalName,
    sourceUrl: source.sourceUrl || undefined,
    processingStatus: mapProcessingStatus(source.ingestionStatus),
    extractionSummary:
      source.ingestionStatus === "COMPLETED"
        ? `We pulled details from ${source.originalName} into your draft.`
        : source.ingestionStatus === "NEEDS_REVIEW"
          ? `${source.originalName} was added and may need a quick review.`
          : `We saved ${source.originalName} and it will be used in your draft.`,
    uploadedAt: source.createdAt.toISOString(),
  }));

  const reviewItems = artifacts
    .filter((artifact) => artifact.status !== "PUBLISHED")
    .map((artifact, index) => ({
      id: artifact.id,
      tenantId: tenant.id,
      entityType: artifact.artifactType,
      fieldName: `${artifact.artifactType.toLowerCase()} review`,
      proposedValue: JSON.stringify(artifact.dataJson).slice(0, 120),
      confidence: artifact.confidence ?? 0.5,
      sourceRef: `Artifact ${index + 1}`,
      reviewStatus: "needs_review" as const,
      reason: artifact.confidence !== null && artifact.confidence < 0.8 ? "Lower-confidence extraction" : "Please confirm before publish",
    }));

  const fallbackReviewItems = !reviewItems.length && uploadedArtifacts.length
    ? uploadedArtifacts.slice(0, 3).map((artifact) => ({
        id: `${artifact.id}-review`,
        tenantId: tenant.id,
        entityType: "UploadedArtifact",
        fieldName: artifact.type === "website" ? "Business link" : "Uploaded document",
        proposedValue: artifact.filename,
        confidence: artifact.type === "website" ? 0.72 : 0.58,
        sourceRef: artifact.filename,
        reviewStatus: "needs_review" as const,
        reason: artifact.type === "website" ? "Confirm this link belongs to your restaurant" : "We may need you to confirm a few details from this file",
      }))
    : [];

  const finalReviewItems = reviewItems.length ? reviewItems : fallbackReviewItems;
  const menuItems = offerings.map((offering, index) => ({
    id: offering.id,
    tenantId: tenant.id,
    categoryId: offering.category || `category-${index + 1}`,
    name: offering.name,
    description: offering.description || "",
    price: Number(offering.basePrice || 0),
    currency: offering.currency || "USD",
    dietaryTags: [],
    modifiers: [],
    available: true,
    soldOutToday: false,
    seasonal: false,
    notes: "",
    confidence: 0.82,
    sourceRefs: ["Published offering"],
  }));

  const categories = Array.from(new Set(menuItems.map((item) => item.categoryId))).map((id, index) => ({
    id,
    tenantId: tenant.id,
    name: menuItems.find((item) => item.categoryId === id)?.categoryId.replace(/-/g, " ") || `Category ${index + 1}`,
    displayOrder: index + 1,
  }));

  const workspace: RestaurantWorkspaceData = {
    ...starter,
    mode: tenant.status === "ACTIVE" ? "demo" : "starter",
    assistantStatus: tenant.status === "ACTIVE" ? "live" : uploadedArtifacts.length ? "needs_review" : "draft",
    profile: {
      ...starter.profile,
      businessName: profile?.businessName || tenant.name,
      businessDescription: profile?.description || starter.profile.businessDescription,
      address: profile?.address || starter.profile.address,
      phone: profile?.phone || starter.profile.phone,
      email: profile?.email || starter.profile.email,
      website: profile?.website || uploadedArtifacts.find((artifact) => artifact.type === "website")?.sourceUrl || starter.profile.website,
      regularHours: profile?.hoursJson
        ? Object.entries(profile.hoursJson as Record<string, string>).map(([day, hours]) => {
            const [open = hours, close = ""] = String(hours).split("-").map((value) => value.trim());
            return { day, open, close: close || open };
          })
        : starter.profile.regularHours,
      status: tenant.status === "ACTIVE" ? "live" : uploadedArtifacts.length ? "needs_review" : "draft",
    },
    menuCategories: categories,
    menuItems,
    cateringPackages: [],
    faqs: faqs.map((faq) => ({
      id: faq.id,
      tenantId: tenant.id,
      category: faq.tagsJson ? "Customer questions" : "General",
      question: faq.question,
      answer: faq.answer,
      confidence: 0.84,
      sourceRefs: ["Published FAQ"],
      editable: true,
      escalationRequired: false,
    })),
    dailyUpdates: [],
    uploadedArtifacts,
    reviewItems: finalReviewItems,
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      tenantId: tenant.id,
      channel: "WhatsApp",
      startedAt: conversation.createdAt.toISOString(),
      status: conversation.status === "ESCALATED" ? "escalated" : conversation.messages.some((m) => m.direction === "OUTBOUND") ? "answered" : "unresolved",
      detectedIntent: "general_question",
      resolvedBy: conversation.status === "ESCALATED" ? "human" : conversation.messages.some((m) => m.direction === "OUTBOUND") ? "assistant" : "pending",
      confidence: 0.71,
      escalationReason: conversation.summary || undefined,
      customerName: conversation.customer.name || conversation.customer.phone,
      customerMessage: conversation.messages.find((m) => m.direction === "INBOUND")?.content || "",
      assistantReply: conversation.messages.find((m) => m.direction === "OUTBOUND")?.content || "",
      sourceRefs: ["Published restaurant data"],
    })),
    extractionSummary: {
      hoursFound: Boolean(profile?.hoursJson),
      addressFound: Boolean(profile?.address),
      phoneFound: Boolean(profile?.phone),
      menuItemsFound: menuItems.length,
      cateringServicesFound: 0,
      reservationDetailsFound: Boolean(profile?.description),
      takeoutDetailsFound: Boolean(profile?.description),
      itemsNeedingReview: finalReviewItems.length,
    },
    previewAnswers: starter.previewAnswers.map((item) => ({
      ...item,
      confidence: tenant.status === "ACTIVE" ? 0.76 : uploadedArtifacts.length ? 0.41 : 0.24,
      sourceRefs: uploadedArtifacts.length ? [uploadedArtifacts[0].filename] : [],
      response: tenant.status === "ACTIVE"
        ? "Your assistant is ready to answer questions using your published restaurant details and uploaded materials."
        : uploadedArtifacts.length
          ? "We have enough to build a first draft. Publish when this looks right, and you can keep improving it afterward."
          : "Once you add your links and documents, we&apos;ll show a realistic preview answer here.",
    })),
    learningSuggestions: conversations.length
      ? [
          {
            id: "learn-1",
            title: "Turn repeated questions into FAQs",
            description: "As more guests message you, we will surface repeated questions here so you can improve the assistant.",
            frequency: conversations.length,
          },
        ]
      : [],
    analytics: {
      conversationVolume: conversations.length,
      autoAnswerRate: conversations.length ? Math.round((conversations.filter((c) => c.messages.some((m) => m.direction === "OUTBOUND")).length / conversations.length) * 100) : 0,
      escalations: conversations.filter((c) => c.status === "ESCALATED").length,
      unansweredTopics: conversations.length ? ["Add more business details for richer answers"] : [],
      topQuestions: faqs.slice(0, 3).map((faq) => ({ label: faq.question, count: 1 })),
      topMenuItemInquiries: menuItems.slice(0, 3).map((item) => ({ label: item.name, count: 1 })),
      reservationTrend: 0,
      takeoutTrend: 0,
      cateringTrend: 0,
    },
    quickActions: tenant.status === "ACTIVE"
      ? [
          { label: "Update profile", href: "/app/restaurant/profile" },
          { label: "Review answers", href: "/app/restaurant/questions" },
          { label: "Preview assistant", href: "/app/restaurant/preview" },
        ]
      : [
          { label: "Add more links", href: "/app/restaurant/onboarding" },
          { label: "Upload documents", href: "/app/restaurant/onboarding/documents" },
          { label: "Review before publish", href: "/app/restaurant/onboarding/review" },
        ],
    notifications: tenant.status === "ACTIVE"
      ? []
      : [{ title: "Finish setup to go live", detail: "Add links, upload documents, then review and publish what we found." }],
  };

  return workspace;
}