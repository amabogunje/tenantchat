import { z } from "zod";

export const hoursSchema = z.record(z.string(), z.string()).default({});

export const businessProfileExtractionSchema = z.object({
  businessName: z.string().default(""),
  description: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  website: z.string().default(""),
  address: z.string().default(""),
  hours: hoursSchema,
  toneInstructions: z.string().default("Helpful, concise, and honest."),
  confidence: z.number().min(0).max(1).default(0.5),
  flags: z.array(z.string()).default([]),
});

export const offeringExtractionSchema = z.object({
  category: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  basePrice: z.number().nullable().optional(),
  currency: z.string().default("USD"),
  durationMinutes: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const faqExtractionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  tags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const policyExtractionSchema = z.object({
  policyType: z.string(),
  title: z.string(),
  body: z.string(),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const structuredExtractionSchema = z.object({
  profile: businessProfileExtractionSchema,
  offerings: z.array(offeringExtractionSchema).default([]),
  faqs: z.array(faqExtractionSchema).default([]),
  policies: z.array(policyExtractionSchema).default([]),
  hours: hoursSchema,
  issues: z.array(z.string()).default([]),
});

export const intentResultSchema = z.object({
  intent: z.enum([
    "ask_hours",
    "ask_location",
    "ask_price",
    "ask_services",
    "ask_booking",
    "ask_policy",
    "ask_status",
    "ask_contact",
    "ask_human",
    "other",
  ]),
  confidence: z.number().min(0).max(1),
  rationale: z.string().default(""),
});

export const answerResultSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  needsEscalation: z.boolean().default(false),
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().optional(),
  citations: z.array(z.string()).default([]),
});

export const escalationSummarySchema = z.object({
  summary: z.string(),
  reason: z.string(),
});

export type StructuredExtraction = z.infer<typeof structuredExtractionSchema>;
export type IntentResult = z.infer<typeof intentResultSchema>;
export type AnswerResult = z.infer<typeof answerResultSchema>;
