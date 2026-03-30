import { load } from "cheerio";
import pdfParse from "pdf-parse";
import sanitizeHtml from "sanitize-html";

export async function extractWebsiteText(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);
  $("script, style, noscript").remove();
  const text = sanitizeHtml($("body").text(), { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

export async function extractPdfText(buffer: Buffer) {
  const parsed = await pdfParse(buffer);
  return parsed.text.replace(/\s+/g, " ").trim();
}

export async function extractPlainText(buffer: Buffer) {
  return buffer.toString("utf8").replace(/\s+/g, " ").trim();
}
