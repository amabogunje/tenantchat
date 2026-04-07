import { Buffer } from "node:buffer";
import { load } from "cheerio";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { SourceType } from "@prisma/client";

function normalizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function extractVisibleTextFromHtml(html: string) {
  const $ = load(html);
  $("script, style, noscript, iframe, svg, nav, footer").remove();

  const title = normalizeWhitespace($("title").first().text());
  const description = normalizeWhitespace($("meta[name='description']").attr("content") || "");

  const contentBlocks = [
    $("h1, h2, h3").map((_, element) => $(element).text()).get().join("\n"),
    $("main").text(),
    $("body").text(),
  ]
    .map((chunk) => normalizeWhitespace(chunk))
    .filter(Boolean);

  return [title, description, ...contentBlocks].filter(Boolean).join("\n\n");
}

export async function extractWebsiteText(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent": "TenantChatBot/1.0 (+https://tenantchat.vercel.app)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch website (${response.status})`);
  }

  const html = await response.text();
  const extractedText = extractVisibleTextFromHtml(html);
  if (!extractedText) {
    throw new Error("We could not find readable website text.");
  }

  return extractedText;
}

export async function extractDocumentText(params: {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  sourceType: SourceType;
}) {
  const { buffer, filename, mimeType = "", sourceType } = params;
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (sourceType === SourceType.PDF || lowerMime === "application/pdf" || lowerName.endsWith(".pdf")) {
    const result = await pdf(buffer);
    return normalizeWhitespace(result.text || "");
  }

  if (lowerName.endsWith(".docx") || lowerMime.includes("wordprocessingml")) {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeWhitespace(result.value || "");
  }

  if (lowerName.endsWith(".doc")) {
    return normalizeWhitespace(`${filename}\n\nLegacy Word documents need manual review in this MVP. Please confirm the extracted details after upload.`);
  }

  return normalizeWhitespace(buffer.toString("utf8"));
}