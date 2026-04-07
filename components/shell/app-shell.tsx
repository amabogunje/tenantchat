import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VerticalConfig } from "@/verticals/shared/types";

export function AppShell({
  children,
  vertical,
  businessName,
  status,
}: {
  children: React.ReactNode;
  vertical: VerticalConfig;
  businessName: string;
  status: "draft" | "needs_review" | "live";
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
      <aside className="w-full max-w-xs rounded-[2rem] border bg-card/90 p-5 shadow-sm backdrop-blur">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">TenantChat for restaurants</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/10" />
            <div>
              <h2 className="text-xl font-semibold">{businessName}</h2>
              <p className="text-sm text-muted-foreground">Calm setup for your WhatsApp assistant</p>
            </div>
          </div>
          <div className="mt-4"><Badge variant={status === "live" ? "success" : status === "needs_review" ? "warning" : "default"}>{status.replace("_", " ")}</Badge></div>
        </div>
        <nav className="space-y-2">
          {vertical.navigation.map((item) => (
            <a key={item.href} href={item.href} className="block rounded-2xl px-3 py-3 hover:bg-muted">
              <div className="font-medium">{item.label}</div>
              {item.description ? <div className="text-xs text-muted-foreground">{item.description}</div> : null}
            </a>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Need a quick trust check?</div>
          <p className="mt-1">Open Assistant Preview to see how guests experience your bot before or after go-live.</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/sign-in" });
          }}
          className="mt-6"
        >
          <Button type="submit" variant="outline" className="w-full">Sign out</Button>
        </form>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

