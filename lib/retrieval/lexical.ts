import type { FAQ, KnowledgeChunk, Offering, Policy } from "@prisma/client";

function scoreText(query: string, text: string) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = text.toLowerCase();
  return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

export function rankChunks(query: string, chunks: Pick<KnowledgeChunk, "chunkText" | "id">[], count = 4) {
  return [...chunks]
    .map((chunk) => ({ ...chunk, score: scoreText(query, chunk.chunkText) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function rankFaqs(query: string, faqs: Pick<FAQ, "question" | "answer" | "id">[], count = 3) {
  return [...faqs]
    .map((faq) => ({
      ...faq,
      score: scoreText(query, `${faq.question} ${faq.answer}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function rankOfferings(query: string, offerings: Pick<Offering, "name" | "description" | "id">[], count = 3) {
  return [...offerings]
    .map((offering) => ({
      ...offering,
      score: scoreText(query, `${offering.name} ${offering.description || ""}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function rankPolicies(query: string, policies: Pick<Policy, "title" | "body" | "id">[], count = 2) {
  return [...policies]
    .map((policy) => ({
      ...policy,
      score: scoreText(query, `${policy.title} ${policy.body}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
