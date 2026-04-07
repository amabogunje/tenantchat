import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <section>
          <div className="inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Restaurant-first WhatsApp assistant for small business owners
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight">Upload the materials you already have. TenantChat turns them into a restaurant assistant your guests can text.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We analyze your website, menu, catering flyers, and notes, then help you review the important details,
            preview guest conversations, and go live with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild><Link href="/sign-up">Start your restaurant setup</Link></Button>
            <Button asChild variant="outline"><Link href="/sign-in">Sign in</Link></Button>
          </div>
        </section>
        <section className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">What the owner experience feels like</div>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl bg-muted/60 p-4">Upload what you already have</div>
            <div className="rounded-2xl bg-muted/60 p-4">See what we found: hours, menu items, takeout details, and more</div>
            <div className="rounded-2xl bg-muted/60 p-4">Preview how guests can ask about reservations, vegan options, and catering</div>
            <div className="rounded-2xl bg-muted/60 p-4">Go live, then make quick daily updates when something changes</div>
          </div>
        </section>
      </div>
    </main>
  );
}
