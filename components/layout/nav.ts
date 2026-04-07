import type { Route } from "next";

export type NavItem = {
  href: Route;
  label: string;
};

export const systemAdminNav: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/platform", label: "Platform" },
];
