import { z } from "zod";

export const timeRangeSchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
});

export const holidayHoursSchema = z.object({
  date: z.string(),
  label: z.string(),
  hours: z.string(),
});

export const temporaryClosureSchema = z.object({
  date: z.string(),
  reason: z.string(),
});

export const socialLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const restaurantProfileSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  businessName: z.string(),
  businessDescription: z.string(),
  cuisineType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  timezone: z.string(),
  regularHours: z.array(timeRangeSchema),
  holidayHours: z.array(holidayHoursSchema),
  temporaryClosures: z.array(temporaryClosureSchema),
  reservationEnabled: z.boolean(),
  reservationInstructions: z.string(),
  reservationMethod: z.string(),
  reservationLink: z.string().optional(),
  takeoutEnabled: z.boolean(),
  takeoutInstructions: z.string(),
  takeoutMethod: z.string(),
  takeoutLink: z.string().optional(),
  cateringEnabled: z.boolean(),
  cateringInstructions: z.string(),
  cateringContactMethod: z.string(),
  parkingInfo: z.string(),
  socialLinks: z.array(socialLinkSchema),
  serviceArea: z.string(),
  status: z.enum(["draft", "needs_review", "live"]),
});

export const menuCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  displayOrder: z.number(),
});

export const menuItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string(),
  dietaryTags: z.array(z.string()),
  modifiers: z.array(z.string()),
  available: z.boolean(),
  soldOutToday: z.boolean(),
  seasonal: z.boolean(),
  notes: z.string(),
  confidence: z.number(),
  sourceRefs: z.array(z.string()),
});

export const cateringPackageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string(),
  pricingModel: z.string(),
  basePrice: z.number(),
  minGuests: z.number(),
  maxGuests: z.number(),
  availabilityRules: z.string(),
  notes: z.string(),
  confidence: z.number(),
  sourceRefs: z.array(z.string()),
});

export const faqEntrySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  category: z.string(),
  question: z.string(),
  answer: z.string(),
  confidence: z.number(),
  sourceRefs: z.array(z.string()),
  editable: z.boolean(),
  escalationRequired: z.boolean(),
});

export const dailyUpdateSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.string(),
  effectiveDate: z.string(),
  expiresAt: z.string().optional(),
  message: z.string(),
  relatedMenuItemId: z.string().optional(),
  active: z.boolean(),
});

export const uploadedArtifactSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.string(),
  filename: z.string(),
  sourceUrl: z.string().optional(),
  processingStatus: z.enum(["uploaded", "processing", "processed", "needs_review"]),
  extractionSummary: z.string(),
  uploadedAt: z.string(),
});

export const extractionReviewItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  entityType: z.string(),
  fieldName: z.string(),
  proposedValue: z.string(),
  confidence: z.number(),
  sourceRef: z.string(),
  reviewStatus: z.enum(["needs_review", "confirmed", "overridden"]),
  reason: z.string(),
});

export const restaurantConversationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  channel: z.string(),
  startedAt: z.string(),
  status: z.enum(["answered", "escalated", "unresolved"]),
  detectedIntent: z.string(),
  resolvedBy: z.enum(["assistant", "human", "pending"]),
  confidence: z.number(),
  escalationReason: z.string().optional(),
  customerName: z.string(),
  customerMessage: z.string(),
  assistantReply: z.string(),
  sourceRefs: z.array(z.string()),
});

export const restaurantWorkspaceSchema = z.object({
  assistantStatus: z.enum(["draft", "needs_review", "live"]),
  profile: restaurantProfileSchema,
  menuCategories: z.array(menuCategorySchema),
  menuItems: z.array(menuItemSchema),
  cateringPackages: z.array(cateringPackageSchema),
  faqs: z.array(faqEntrySchema),
  dailyUpdates: z.array(dailyUpdateSchema),
  uploadedArtifacts: z.array(uploadedArtifactSchema),
  reviewItems: z.array(extractionReviewItemSchema),
  conversations: z.array(restaurantConversationSchema),
});

export type RestaurantProfile = z.infer<typeof restaurantProfileSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type CateringPackage = z.infer<typeof cateringPackageSchema>;
export type FAQEntry = z.infer<typeof faqEntrySchema>;
export type DailyUpdate = z.infer<typeof dailyUpdateSchema>;
export type UploadedArtifact = z.infer<typeof uploadedArtifactSchema>;
export type ExtractionReviewItem = z.infer<typeof extractionReviewItemSchema>;
export type RestaurantConversation = z.infer<typeof restaurantConversationSchema>;
