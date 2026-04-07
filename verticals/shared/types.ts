import { z } from "zod";

export type VerticalIntentHandler =
  | "reservation-flow"
  | "takeout-flow"
  | "catering-flow"
  | "faq-flow"
  | "escalation-flow";

export type AssistantBehaviorConfig = {
  tone: "friendly" | "formal" | "casual";
  verbosity: "concise" | "normal" | "detailed";
  upsellEnabled: boolean;
  escalationRules: {
    lowConfidence: boolean;
    complaint: boolean;
    pricingAmbiguity: boolean;
  };
};

export type VerticalPreviewPrompt = {
  id: string;
  prompt: string;
  intent: string;
};

export type VerticalDashboardWidget = {
  id: string;
  label: string;
  description: string;
};

export type VerticalNavigationItem = {
  href: string;
  label: string;
  description?: string;
};

export type VerticalConfig = {
  key: string;
  label: string;
  ownerRouteBase: string;
  profileSchema: z.ZodTypeAny;
  catalogSchema: z.ZodTypeAny;
  faqCategories: string[];
  onboardingPrompts: string[];
  extractionRules: string[];
  reviewRules: string[];
  previewQuestions: VerticalPreviewPrompt[];
  operationalUpdateTypes: string[];
  conversationIntents: string[];
  intentHandlers: Record<string, VerticalIntentHandler>;
  actions: string[];
  intentActionMap: Partial<Record<string, string[]>>;
  assistantBehavior: AssistantBehaviorConfig;
  dashboardWidgets: VerticalDashboardWidget[];
  navigation: VerticalNavigationItem[];
};
