import type { Tenant } from "@prisma/client";
import "@/verticals/restaurant";
import { getVerticalConfig, resolveVerticalKey } from "@/verticals/shared/registry";
import { getRestaurantWorkspaceData } from "@/verticals/restaurant/mock-data";

export function getTenantVertical(tenant: Tenant) {
  const key = resolveVerticalKey(tenant.industryType);
  if (!key) return null;
  return getVerticalConfig(key);
}

export function getVerticalWorkspaceData(tenant: Tenant) {
  const key = resolveVerticalKey(tenant.industryType);
  if (key === "restaurant") {
    return getRestaurantWorkspaceData(tenant);
  }
  return null;
}
