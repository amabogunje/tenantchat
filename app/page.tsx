import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <section>
          <div className="inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Multi-tenant WhatsApp AI support for small businesses
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">TenantChat turns business content into grounded WhatsApp customer service.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Onboard a tenant, connect a Twilio WhatsApp sandbox, ingest business documents, review extracted knowledge,
            and answer customer questions with human handoff when confidence is low.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild><Link href="/sign-up">Start free MVP</Link></Button>
            <Button asChild variant="outline"><Link href="/sign-in">Sign in</Link></Button>
          </div>
        </section>
        <section className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">MVP flow</h2>
          <ol className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li>1. Create tenant and choose an industry pack.</li>
            <li>2. Upload website URLs, PDFs, menus, or service lists.</li>
            <li>3. Review and publish extracted profile, offerings, FAQs, and policies.</li>
            <li>4. Receive grounded WhatsApp replies with escalation support.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
