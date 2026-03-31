import type { Route } from "next";

export type NavItem = {
  href: Route;
  label: string;
};

export const tenantNav: NavItem[] = [
  { href: "/app", label: "Overview" },
  { href: "/app/onboarding", label: "Onboarding" },
  { href: "/app/settings", label: "Business settings" },
  { href: "/app/sources", label: "Sources" },
  { href: "/app/knowledge", label: "Knowledge" },
  { href: "/app/conversations", label: "Conversations" },
  { href: "/app/escalations", label: "Escalations" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/channel", label: "Messaging status" },
];

export const systemAdminNav: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/platform", label: "Platform" },
];
