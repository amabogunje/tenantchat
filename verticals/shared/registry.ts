import { IndustryType } from "@prisma/client";
import type { VerticalConfig } from "@/verticals/shared/types";

const registry = new Map<string, VerticalConfig>();

export function registerVertical(config: VerticalConfig) {
  registry.set(config.key, config);
  return config;
}

export function getVerticalConfig(key: string) {
  const vertical = registry.get(key);
  if (!vertical) {
    throw new Error(`Vertical not registered: ${key}`);
  }
  return vertical;
}

export function getVerticalNavigation(key: string) {
  return getVerticalConfig(key).navigation;
}

export function getVerticalSchemas(key: string) {
  const vertical = getVerticalConfig(key);
  return {
    profileSchema: vertical.profileSchema,
    catalogSchema: vertical.catalogSchema,
  };
}

export function getVerticalReviewRules(key: string) {
  return getVerticalConfig(key).reviewRules;
}

export function getVerticalRoutes(key: string) {
  return getVerticalNavigation(key).map((item) => item.href);
}

export function resolveVerticalKey(industryType: IndustryType) {
  if (industryType === "RESTAURANT") return "restaurant";
  return null;
}
