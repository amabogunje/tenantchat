import Link from "next/link";
import { appNav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

export function Sidebar() {
  return (
    <aside className="w-full max-w-xs rounded-3xl border bg-card p-5 shadow-sm">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">TenantChat</div>
        <h2 className="mt-2 text-2xl font-semibold">Control Plane</h2>
      </div>
      <nav className="space-y-2">
        {appNav.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">
            {item.label}
          </Link>
        ))}
      </nav>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/sign-in" });
        }}
        className="mt-8"
      >
        <Button type="submit" variant="outline" className="w-full">Sign out</Button>
      </form>
    </aside>
  );
}
