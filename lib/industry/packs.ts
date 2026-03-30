import { IndustryType } from "@prisma/client";

export type IndustryPack = {
  id: IndustryType;
  label: string;
  summary: string;
  defaultIntents: string[];
  extractionHints: string[];
  faqHints: string[];
  entityTypes: string[];
  offeringMetadata: string[];
};

export const INDUSTRY_PACKS: Record<IndustryType, IndustryPack> = {
  RESTAURANT: {
    id: IndustryType.RESTAURANT,
    label: "Restaurant",
    summary: "Menu-driven hospitality businesses with location, hours, pickup, and allergen questions.",
    defaultIntents: ["ask_hours", "ask_location", "ask_price", "ask_services", "ask_policy", "ask_human"],
    extractionHints: ["menus", "signature dishes", "allergens", "pickup or delivery", "reservation guidance"],
    faqHints: ["Do you have vegan options?", "Do you take reservations?", "What are your hours?"],
    entityTypes: ["menu_section", "dish", "allergen_policy"],
    offeringMetadata: ["dietaryTags", "spiceLevel", "portion"],
  },
  BARBER: {
    id: IndustryType.BARBER,
    label: "Barber / Salon",
    summary: "Service businesses centered on appointment readiness, walk-ins, durations, and grooming services.",
    defaultIntents: ["ask_hours", "ask_price", "ask_services", "ask_booking", "ask_policy", "ask_human"],
    extractionHints: ["service list", "duration", "walk-in policy", "lateness policy", "appointment prep"],
    faqHints: ["Do you take walk-ins?", "How long is a haircut?", "What should I do if I'm late?"],
    entityTypes: ["service", "stylist", "policy"],
    offeringMetadata: ["durationMinutes", "stylistLevel", "requiresAppointment"],
  },
  MECHANIC: {
    id: IndustryType.MECHANIC,
    label: "Mechanic / Auto Service",
    summary: "Repair shops with diagnostic, estimate, turnaround, and warranty conversations.",
    defaultIntents: ["ask_hours", "ask_price", "ask_services", "ask_status", "ask_policy", "ask_human"],
    extractionHints: ["service categories", "diagnostics", "estimate process", "drop-off", "warranty"],
    faqHints: ["Do I need an appointment?", "How long do diagnostics take?", "Do you offer warranties?"],
    entityTypes: ["service", "vehicle_type", "warranty"],
    offeringMetadata: ["vehicleTypes", "diagnosticRequired", "turnaroundEstimate"],
  },
};

export function getIndustryPack(industry: IndustryType) {
  return INDUSTRY_PACKS[industry];
}
