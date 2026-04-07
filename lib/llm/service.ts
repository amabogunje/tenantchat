import { Buffer } from "node:buffer";
import { IndustryType } from "@prisma/client";
import { getIndustryPack } from "@/lib/industry/packs";
import { getOpenAIClient, getOpenAIModel } from "@/lib/llm/client";
import { buildExtractionPrompt } from "@/prompts/extraction";
import { buildRuntimePrompt } from "@/prompts/runtime";
import {
  answerResultSchema,
  escalationSummarySchema,
  intentResultSchema,
  structuredExtractionSchema,
  type AnswerResult,
  type IntentResult,
  type StructuredExtraction,
} from "@/types/knowledge";

function heuristicIntent(message: string): IntentResult {
  const normalized = message.toLowerCase();
  const map: Array<[IntentResult["intent"], RegExp]> = [
    ["ask_human", /(human|person|agent|someone)/],
    ["ask_hours", /(hours|open|close|closing)/],
    ["ask_location", /(address|where|located|location)/],
    ["ask_price", /(price|cost|how much)/],
    ["ask_services", /(services|offer|menu|do you do)/],
    ["ask_booking", /(book|appointment|reserve|reservation)/],
    ["ask_policy", /(policy|refund|late|cancel|warranty)/],
    ["ask_status", /(status|update|ready|estimate|turnaround)/],
    ["ask_contact", /(call|phone|email|contact)/],
  ];
  const found = map.find(([, pattern]) => pattern.test(normalized));
  return {
    intent: found?.[0] ?? "other",
    confidence: found ? 0.74 : 0.42,
    rationale: found ? "Matched keyword pattern" : "No strong keyword match",
  };
}

function parseJsonFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced) {
      try {
        return JSON.parse(fenced.trim());
      } catch {
        // continue
      }
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
}

function normalizeText(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function coerceOfferings(raw: unknown) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          name: normalizeText(entry).slice(0, 120),
          description: entry,
          currency: "USD",
          metadata: {},
          confidence: 0.45,
        };
      }

      if (!entry || typeof entry !== "object") return null;

      const record = entry as Record<string, unknown>;
      const name = [record.name, record.title, record.item, record.service]
        .map((value) => (typeof value === "string" ? normalizeText(value) : ""))
        .find(Boolean);

      if (!name) return null;

      const rawPrice = record.basePrice ?? record.price ?? record.amount ?? null;
      const numericPrice = typeof rawPrice === "number"
        ? rawPrice
        : typeof rawPrice === "string"
          ? Number(rawPrice.replace(/[^0-9.]/g, "")) || null
          : null;

      return {
        category: typeof record.category === "string" ? normalizeText(record.category) : undefined,
        name,
        description: typeof record.description === "string" ? normalizeText(record.description) : undefined,
        basePrice: numericPrice,
        currency: typeof record.currency === "string" ? normalizeText(record.currency) : "USD",
        durationMinutes: typeof record.durationMinutes === "number" ? record.durationMinutes : null,
        metadata: typeof record.metadata === "object" && record.metadata ? record.metadata : {},
        confidence: typeof record.confidence === "number" ? record.confidence : 0.5,
      };
    })
    .filter(Boolean);
}

function normalizeStructuredPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const record = payload as Record<string, unknown>;
  return {
    ...record,
    offerings: coerceOfferings(record.offerings),
  };
}

export async function generateStructuredExtraction(input: {
  industry: IndustryType;
  text: string;
}): Promise<StructuredExtraction> {
  const client = getOpenAIClient();
  const prompt = `${buildExtractionPrompt(getIndustryPack(input.industry).summary, input.text)}\n\nReturn valid JSON with this shape only:\n{\n  "profile": {"businessName":"","description":"","phone":"","email":"","website":"","address":"","hours":{},"toneInstructions":"","confidence":0.5,"flags":[]},\n  "offerings": [],\n  "faqs": [],\n  "policies": [],\n  "hours": {},\n  "issues": []\n}`;
  if (!client) {
    return structuredExtractionSchema.parse({
      profile: {
        businessName: "",
        description: input.text.slice(0, 180),
        phone: "",
        email: "",
        website: "",
        address: "",
        hours: {},
        toneInstructions: "Helpful, concise, and honest.",
        confidence: 0.35,
        flags: ["OpenAI API key missing, using fallback extraction."],
      },
      offerings: [],
      faqs: [],
      policies: [],
      hours: {},
      issues: ["LLM extraction unavailable"],
    });
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: "You extract structured JSON from tenant business content.",
      },
      { role: "user", content: prompt },
    ],
  });

  const parsed = normalizeStructuredPayload(parseJsonFromText(response.output_text || ""));
  if (!parsed) {
    throw new Error("Structured extraction response was not valid JSON.");
  }

  return structuredExtractionSchema.parse(parsed);
}

export async function extractImageText(input: {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    return "";
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: "Extract readable text from business document images. Preserve menu items, prices, headings, and contact details. Return plain text only.",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `This image is a restaurant business document named ${input.filename}. Read it carefully and extract the visible text in a clean plain-text format. Preserve menu item names, prices, catering package details, and headings. Do not summarize.`,
          },
          {
            type: "input_image",
            image_url: `data:${input.mimeType || "image/jpeg"};base64,${input.buffer.toString("base64")}`,
            detail: "high",
          },
        ],
      },
    ],
  });

  return normalizeText(response.output_text || "");
}

export async function classifyIntent(message: string): Promise<IntentResult> {
  const fallback = heuristicIntent(message);
  const client = getOpenAIClient();
  if (!client) return fallback;

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: "Classify the customer message into the allowed intent taxonomy and return valid JSON only with keys intent, confidence, rationale.",
      },
      {
        role: "user",
        content: `Message: ${message}`,
      },
    ],
  });

  const parsed = parseJsonFromText(response.output_text || "");
  try {
    return intentResultSchema.parse(parsed || {});
  } catch {
    return fallback;
  }
}

export async function answerCustomerQuestion(input: {
  tenantName: string;
  toneInstructions?: string | null;
  customerMessage: string;
  structuredFacts: string[];
  faqs: string[];
  chunks: string[];
}): Promise<AnswerResult> {
  const client = getOpenAIClient();
  const fallbackAnswer = answerResultSchema.parse({
    answer:
      input.structuredFacts[0] ||
      input.faqs[0] ||
      "I'm not fully sure from the approved business knowledge yet. I can help connect you to a human.",
    confidence: input.structuredFacts.length + input.faqs.length > 0 ? 0.67 : 0.28,
    needsEscalation: input.structuredFacts.length + input.faqs.length === 0,
    needsClarification: false,
    citations: [],
  });

  if (!client) return fallbackAnswer;

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: "Answer customer questions with grounded tenant knowledge. Return valid JSON only with keys answer, confidence, needsEscalation, needsClarification, clarificationQuestion, citations.",
      },
      {
        role: "user",
        content: `${buildRuntimePrompt(input)}\n\nReturn valid JSON like:\n{"answer":"","confidence":0.0,"needsEscalation":false,"needsClarification":false,"clarificationQuestion":"","citations":[]}`,
      },
    ],
  });

  const parsed = parseJsonFromText(response.output_text || "");
  if (parsed) {
    try {
      return answerResultSchema.parse(parsed);
    } catch {
      // fall through to raw-text rescue
    }
  }

  const rawText = (response.output_text || "").trim();
  if (rawText) {
    return answerResultSchema.parse({
      answer: rawText,
      confidence: 0.72,
      needsEscalation: false,
      needsClarification: false,
      citations: [],
    });
  }

  return fallbackAnswer;
}

export async function summarizeEscalation(messageHistory: string): Promise<{ summary: string; reason: string }> {
  const client = getOpenAIClient();
  const fallback = {
    summary: messageHistory.slice(0, 240),
    reason: "Customer requested human support or confidence was low.",
  };
  if (!client) return fallback;

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      { role: "system", content: "Summarize the escalation and produce valid JSON only with keys summary and reason." },
      { role: "user", content: messageHistory },
    ],
  });

  const parsed = parseJsonFromText(response.output_text || "");
  try {
    return escalationSummarySchema.parse(parsed || {});
  } catch {
    return fallback;
  }
}