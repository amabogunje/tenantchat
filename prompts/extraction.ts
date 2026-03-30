export function buildExtractionPrompt(industrySummary: string, text: string) {
  return `
You extract structured business knowledge for a SaaS admin dashboard.
Industry context: ${industrySummary}

Rules:
- Use only facts in the source text.
- If a field is missing, leave it blank rather than inventing it.
- Normalize services, FAQs, hours, and policies.
- Return concise factual text.
- Flag ambiguity in issues or flags.

Source text:
${text.slice(0, 12000)}
`.trim();
}
