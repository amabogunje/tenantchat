import { describe, expect, it } from "vitest";
import { extractVisibleTextFromHtml } from "@/lib/ingestion/extract";

describe("HTML extraction", () => {
  it("keeps readable page content and drops scripts", () => {
    const html = `
      <html>
        <head>
          <title>Rivera Kitchen</title>
          <meta name="description" content="Modern Latin restaurant in Brooklyn" />
          <script>window.bad = true;</script>
        </head>
        <body>
          <main>
            <h1>Rivera Kitchen</h1>
            <p>Open daily for lunch and dinner.</p>
            <p>We offer takeout and catering.</p>
          </main>
        </body>
      </html>
    `;

    const text = extractVisibleTextFromHtml(html);

    expect(text).toContain("Rivera Kitchen");
    expect(text).toContain("Modern Latin restaurant in Brooklyn");
    expect(text).toContain("Open daily for lunch and dinner.");
    expect(text).not.toContain("window.bad");
  });
});