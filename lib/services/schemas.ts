import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().min(2),
  industryType: z.enum(["RESTAURANT", "BARBER", "MECHANIC"]),
  description: z.string().optional(),
});

export const profileSchema = z.object({
  tenantName: z.string().min(2).optional(),
  industryType: z.enum(["RESTAURANT", "BARBER", "MECHANIC"]).optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  hoursJson: z.record(z.string(), z.string()).optional(),
  toneInstructions: z.string().optional(),
});

export const channelSchema = z.object({
  externalNumber: z.string().min(4),
  accountSid: z.string().min(4),
  authToken: z.string().min(4),
  webhookSecret: z.string().optional(),
});

export const websiteSourceSchema = z.object({ url: z.string().url() });
export const textSourceSchema = z.object({ originalName: z.string(), sourceType: z.enum(["TEXT", "PDF", "IMAGE"]).default("TEXT"), extractedText: z.string().min(1) });
export const updateFaqSchema = z.object({ question: z.string().min(1), answer: z.string().min(1), published: z.boolean().optional() });
export const updateOfferingSchema = z.object({ name: z.string().min(1), description: z.string().optional(), category: z.string().optional(), basePrice: z.number().nullable().optional(), durationMinutes: z.number().nullable().optional(), published: z.boolean().optional() });
export const escalationSchema = z.object({ reason: z.string().min(3) });
