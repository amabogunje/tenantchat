import { ArtifactStatus, ArtifactType, SourceType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { extractWebsiteText } from "@/lib/ingestion/extract";
import { generateStructuredExtraction } from "@/lib/llm/service";

function chunkText(text: string, size = 500) {
  return text.match(new RegExp(`.{1,${size}}`, "g")) || [];
}

export async function createWebsiteSource(tenantId: string, url: string) {
  return prisma.sourceDocument.create({
    data: {
      tenantId,
      sourceType: SourceType.WEBSITE,
      originalName: url,
      sourceUrl: url,
      ingestionStatus: "PENDING",
    },
  });
}

export async function createTextSource(tenantId: string, originalName: string, extractedText: string, sourceType: SourceType = SourceType.TEXT) {
  return prisma.sourceDocument.create({
    data: {
      tenantId,
      sourceType,
      originalName,
      extractedText,
      ingestionStatus: "PENDING",
    },
  });
}

async function resolveSourceText(source: { id: string; sourceType: SourceType; extractedText: string | null; sourceUrl: string | null; originalName: string; }) {
  if (source.sourceType === SourceType.WEBSITE && source.sourceUrl) {
    const websiteText = await extractWebsiteText(source.sourceUrl);
    await prisma.sourceDocument.update({
      where: { id: source.id },
      data: { extractedText: websiteText, metadataJson: { fetchedAt: new Date().toISOString(), sourceUrl: source.sourceUrl } },
    });
    return websiteText;
  }

  if (source.extractedText?.trim()) {
    return source.extractedText.trim();
  }

  return `Source URL: ${source.sourceUrl || source.originalName}`;
}

export async function processSource(sourceId: string) {
  const source = await prisma.sourceDocument.findUnique({ include: { tenant: true }, where: { id: sourceId } });
  if (!source) throw new Error("Source not found");

  await prisma.sourceDocument.update({ where: { id: sourceId }, data: { ingestionStatus: "PROCESSING" } });

  try {
    const text = await resolveSourceText(source);
    const extraction = await generateStructuredExtraction({ industry: source.tenant.industryType, text });

    await prisma.extractedArtifact.createMany({
      data: [
        { tenantId: source.tenantId, sourceDocumentId: source.id, artifactType: ArtifactType.PROFILE, status: ArtifactStatus.DRAFT, confidence: extraction.profile.confidence, dataJson: extraction.profile },
        ...extraction.offerings.map((item) => ({ tenantId: source.tenantId, sourceDocumentId: source.id, artifactType: ArtifactType.OFFERING, status: ArtifactStatus.DRAFT, confidence: item.confidence, dataJson: item })),
        ...extraction.faqs.map((item) => ({ tenantId: source.tenantId, sourceDocumentId: source.id, artifactType: ArtifactType.FAQ, status: ArtifactStatus.DRAFT, confidence: item.confidence, dataJson: item })),
        ...extraction.policies.map((item) => ({ tenantId: source.tenantId, sourceDocumentId: source.id, artifactType: ArtifactType.POLICY, status: ArtifactStatus.DRAFT, confidence: item.confidence, dataJson: item })),
      ],
    });

    await prisma.knowledgeChunk.createMany({
      data: chunkText(text).map((chunk) => ({
        tenantId: source.tenantId,
        sourceDocumentId: source.id,
        chunkText: chunk,
        metadataJson: { sourceType: source.sourceType },
        published: false,
      })),
    });

    await prisma.sourceDocument.update({ where: { id: source.id }, data: { ingestionStatus: extraction.issues.length ? "NEEDS_REVIEW" : "COMPLETED" } });

    return extraction;
  } catch (error) {
    await prisma.sourceDocument.update({ where: { id: source.id }, data: { ingestionStatus: "FAILED" } });
    throw error;
  }
}

export async function publishKnowledge(tenantId: string) {
  const artifacts = await prisma.extractedArtifact.findMany({ where: { tenantId, status: { in: ["DRAFT", "REVIEWED"] } } });
  const profileArtifact = artifacts.find((artifact) => artifact.artifactType === "PROFILE");
  if (profileArtifact) {
    const profile = profileArtifact.dataJson as Record<string, any>;
    await prisma.businessProfile.upsert({
      where: { tenantId },
      update: {
        businessName: String(profile.businessName || "Business"),
        description: String(profile.description || ""),
        phone: String(profile.phone || ""),
        email: String(profile.email || ""),
        website: String(profile.website || ""),
        address: String(profile.address || ""),
        hoursJson: profile.hours || {},
        toneInstructions: String(profile.toneInstructions || "Helpful, concise, and honest."),
        isPublished: true,
        publishedVersion: { increment: 1 },
      },
      create: {
        tenantId,
        businessName: String(profile.businessName || "Business"),
        description: String(profile.description || ""),
        phone: String(profile.phone || ""),
        email: String(profile.email || ""),
        website: String(profile.website || ""),
        address: String(profile.address || ""),
        hoursJson: profile.hours || {},
        toneInstructions: String(profile.toneInstructions || "Helpful, concise, and honest."),
        isPublished: true,
      },
    });
  }

  await prisma.fAQ.deleteMany({ where: { tenantId } });
  await prisma.offering.deleteMany({ where: { tenantId } });
  await prisma.policy.deleteMany({ where: { tenantId } });

  for (const artifact of artifacts) {
    const data = artifact.dataJson as Record<string, any>;
    if (artifact.artifactType === "FAQ") {
      await prisma.fAQ.create({ data: { tenantId, question: String(data.question || ""), answer: String(data.answer || ""), tagsJson: data.tags || [], sourceArtifactId: artifact.id, published: true } });
    }
    if (artifact.artifactType === "OFFERING") {
      await prisma.offering.create({ data: { tenantId, category: data.category ? String(data.category) : null, name: String(data.name || "Service"), description: data.description ? String(data.description) : null, basePrice: data.basePrice ?? null, currency: data.currency ? String(data.currency) : "USD", durationMinutes: data.durationMinutes ?? null, metadataJson: data.metadata || {}, sourceArtifactId: artifact.id, published: true } });
    }
    if (artifact.artifactType === "POLICY") {
      await prisma.policy.create({ data: { tenantId, policyType: String(data.policyType || "general"), title: String(data.title || "Policy"), body: String(data.body || ""), sourceArtifactId: artifact.id, published: true } });
    }
  }

  await prisma.knowledgeChunk.updateMany({ where: { tenantId }, data: { published: true } });
  await prisma.extractedArtifact.updateMany({ where: { tenantId }, data: { status: "PUBLISHED" } });
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "ACTIVE" } });
}