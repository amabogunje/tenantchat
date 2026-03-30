import { describe, expect, it } from "vitest";
import { rankChunks, rankFaqs, rankOfferings } from "@/lib/retrieval/lexical";

describe("retrieval ranking", () => {
  it("prioritizes the most relevant chunk", () => {
    const result = rankChunks("hours open", [
      { id: "a", chunkText: "We are open from 9am to 5pm every weekday." },
      { id: "b", chunkText: "Our warranty policy lasts 30 days." },
    ]);
    expect(result[0]?.id).toBe("a");
  });

  it("prioritizes matching FAQs and offerings", () => {
    const faqs = rankFaqs("price haircut", [
      { id: "1", question: "How much is a haircut?", answer: "$30" },
      { id: "2", question: "Where are you located?", answer: "Downtown" },
    ]);
    const offerings = rankOfferings("beard trim", [
      { id: "1", name: "Beard trim", description: "Precision beard shaping" },
      { id: "2", name: "Oil change", description: "Synthetic oil service" },
    ]);
    expect(faqs[0]?.id).toBe("1");
    expect(offerings[0]?.id).toBe("1");
  });
});
