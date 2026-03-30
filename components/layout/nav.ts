import type { Route } from "next";

export type NavItem = {
  href: Route;
  label: string;
};

export const appNav: NavItem[] = [
  { href: "/app", label: "Overview" },
  { href: "/app/onboarding", label: "Onboarding" },
  { href: "/app/settings", label: "Settings" },
  { href: "/app/channel", label: "WhatsApp" },
  { href: "/app/sources", label: "Sources" },
  { href: "/app/knowledge", label: "Knowledge" },
  { href: "/app/conversations", label: "Conversations" },
  { href: "/app/escalations", label: "Escalations" },
  { href: "/app/analytics", label: "Analytics" },
];
