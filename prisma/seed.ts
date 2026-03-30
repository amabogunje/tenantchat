import { IndustryType, SourceType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { encryptSecret } from "@/lib/security/crypto";

async function seedTenant(input: {
  ownerEmail: string;
  ownerName: string;
  password: string;
  tenantName: string;
  slug: string;
  industryType: IndustryType;
  description: string;
  website: string;
  phone: string;
  address: string;
  externalNumber: string;
  offerings: Array<{ name: string; description: string; basePrice?: number }>;
  faqs: Array<{ question: string; answer: string }>;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.ownerEmail },
    update: {},
    create: { name: input.ownerName, email: input.ownerEmail, passwordHash: await hashPassword(input.password) },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: input.slug },
    update: { name: input.tenantName, industryType: input.industryType, status: "ACTIVE" },
    create: {
      name: input.tenantName,
      slug: input.slug,
      industryType: input.industryType,
      status: "ACTIVE",
      members: { create: { userId: user.id, role: "owner" } },
    },
  });

  await prisma.businessProfile.upsert({
    where: { tenantId: tenant.id },
    update: {
      businessName: input.tenantName,
      description: input.description,
      website: input.website,
      phone: input.phone,
      address: input.address,
      hoursJson: { Monday: "9am-6pm", Tuesday: "9am-6pm", Wednesday: "9am-6pm", Thursday: "9am-6pm", Friday: "9am-7pm", Saturday: "10am-4pm", Sunday: "Closed" },
      toneInstructions: "Friendly, concise, and grounded.",
      isPublished: true,
    },
    create: {
      tenantId: tenant.id,
      businessName: input.tenantName,
      description: input.description,
      website: input.website,
      phone: input.phone,
      address: input.address,
      hoursJson: { Monday: "9am-6pm", Tuesday: "9am-6pm", Wednesday: "9am-6pm", Thursday: "9am-6pm", Friday: "9am-7pm", Saturday: "10am-4pm", Sunday: "Closed" },
      toneInstructions: "Friendly, concise, and grounded.",
      isPublished: true,
    },
  });

  await prisma.escalationRule.upsert({
    where: { tenantId: tenant.id },
    update: { contactLabel: "Owner", contactValue: input.ownerEmail, acknowledgementMsg: "Thanks, a human from the shop will follow up shortly." },
    create: { tenantId: tenant.id, contactLabel: "Owner", contactValue: input.ownerEmail, acknowledgementMsg: "Thanks, a human from the shop will follow up shortly." },
  });

  await prisma.channelConnection.upsert({
    where: { provider_externalNumber: { provider: "TWILIO", externalNumber: input.externalNumber } },
    update: { tenantId: tenant.id, accountSid: process.env.TWILIO_ACCOUNT_SID || "sandbox-account", authTokenEncrypted: encryptSecret(process.env.TWILIO_AUTH_TOKEN || "sandbox-token"), status: "CONNECTED" },
    create: {
      tenantId: tenant.id,
      provider: "TWILIO",
      externalNumber: input.externalNumber,
      accountSid: process.env.TWILIO_ACCOUNT_SID || "sandbox-account",
      authTokenEncrypted: encryptSecret(process.env.TWILIO_AUTH_TOKEN || "sandbox-token"),
      status: "CONNECTED",
    },
  });

  await prisma.offering.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.fAQ.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.policy.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.sourceDocument.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.knowledgeChunk.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.extractedArtifact.deleteMany({ where: { tenantId: tenant.id } });

  const source = await prisma.sourceDocument.create({
    data: {
      tenantId: tenant.id,
      sourceType: SourceType.TEXT,
      originalName: `${input.slug}-starter.txt`,
      ingestionStatus: "COMPLETED",
      extractedText: `${input.description}\n${input.offerings.map((item) => `${item.name}: ${item.description}`).join("\n")}\n${input.faqs.map((item) => `${item.question}: ${item.answer}`).join("\n")}`,
    },
  });

  await prisma.knowledgeChunk.createMany({ data: input.offerings.map((item) => ({ tenantId: tenant.id, sourceDocumentId: source.id, chunkText: `${item.name}: ${item.description}`, published: true })) });
  await prisma.offering.createMany({ data: input.offerings.map((item) => ({ tenantId: tenant.id, name: item.name, description: item.description, basePrice: item.basePrice ?? null, published: true })) });
  await prisma.fAQ.createMany({ data: input.faqs.map((item) => ({ tenantId: tenant.id, question: item.question, answer: item.answer, published: true })) });
}

async function main() {
  await seedTenant({
    ownerEmail: "restaurant@example.com",
    ownerName: "Rosa Rivera",
    password: "password123",
    tenantName: "Rivera Kitchen",
    slug: "rivera-kitchen",
    industryType: IndustryType.RESTAURANT,
    description: "Neighborhood restaurant serving lunch, dinner, and pickup orders.",
    website: "https://rivera-kitchen.example.com",
    phone: "(555) 010-1000",
    address: "12 Market Street",
    externalNumber: "whatsapp:+15550101000",
    offerings: [
      { name: "Lunch special", description: "Rotating lunch plate with soup or salad.", basePrice: 14 },
      { name: "Family tray", description: "Feeds four with entree and sides.", basePrice: 38 },
    ],
    faqs: [
      { question: "Do you offer pickup?", answer: "Yes, pickup is available during business hours." },
      { question: "Do you have vegetarian options?", answer: "Yes, vegetarian items are available daily." },
    ],
  });

  await seedTenant({
    ownerEmail: "barber@example.com",
    ownerName: "Noah James",
    password: "password123",
    tenantName: "Northside Barber",
    slug: "northside-barber",
    industryType: IndustryType.BARBER,
    description: "Modern neighborhood barber shop offering cuts, fades, and beard care.",
    website: "https://northside-barber.example.com",
    phone: "(555) 010-2000",
    address: "210 Main Avenue",
    externalNumber: "whatsapp:+15550102000",
    offerings: [
      { name: "Classic haircut", description: "Clipper and scissor cut with neck cleanup.", basePrice: 30 },
      { name: "Haircut and beard trim", description: "Full cut plus shaped beard trim.", basePrice: 45 },
    ],
    faqs: [
      { question: "Do you take walk-ins?", answer: "Yes, walk-ins are welcome when chairs are available." },
      { question: "How long is a haircut?", answer: "Most haircut appointments take about 30 minutes." },
    ],
  });

  await seedTenant({
    ownerEmail: "mechanic@example.com",
    ownerName: "Maya Patel",
    password: "password123",
    tenantName: "Atlas Auto Care",
    slug: "atlas-auto-care",
    industryType: IndustryType.MECHANIC,
    description: "Independent auto service shop focused on diagnostics, brakes, and maintenance.",
    website: "https://atlas-auto.example.com",
    phone: "(555) 010-3000",
    address: "88 Industrial Road",
    externalNumber: "whatsapp:+15550103000",
    offerings: [
      { name: "Diagnostic inspection", description: "Initial vehicle inspection and code scan.", basePrice: 95 },
      { name: "Brake service", description: "Pad and rotor replacement pricing varies by vehicle.", basePrice: 250 },
    ],
    faqs: [
      { question: "Do I need an appointment?", answer: "Appointments are recommended, but we can often take same-day drop-offs." },
      { question: "Do you offer warranties?", answer: "Yes, qualifying repairs include a limited workmanship warranty." },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
