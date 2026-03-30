import { describe, expect, it } from "vitest";
import { structuredExtractionSchema } from "@/types/knowledge";

describe("structured extraction schema", () => {
  it("normalizes partial extraction payloads", () => {
    const parsed = structuredExtractionSchema.parse({
      profile: {
        businessName: "Northside Barber",
        description: "Classic cuts and beard trims.",
        confidence: 0.8,
      },
      offerings: [{ name: "Haircut" }],
      faqs: [{ question: "Do you take walk-ins?", answer: "Yes" }],
      policies: [],
      hours: { Monday: "9am-6pm" },
      issues: [],
    });

    expect(parsed.profile.businessName).toBe("Northside Barber");
    expect(parsed.offerings[0]?.currency).toBe("USD");
    expect(parsed.faqs[0]?.tags).toEqual([]);
  });
});
