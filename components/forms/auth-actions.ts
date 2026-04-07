import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import { IndustryType } from "@prisma/client";

export async function registerUser(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const businessName = String(formData.get("businessName") || "");
  const industry = String(formData.get("industry") || IndustryType.RESTAURANT) as IndustryType;

  await prisma.user.create({
    data: {
      name,
      email,
      role: "TENANT_ADMIN",
      passwordHash: await hashPassword(password),
      tenantMembers: {
        create: {
          role: "owner",
          tenant: {
            create: {
              name: businessName || `${name}'s Business`,
              slug: slugify(businessName || `${name}-business`),
              industryType: industry,
              status: "DRAFT",
              businessProfiles: {
                create: {
                  businessName: businessName || `${name}'s Business`,
                  description: "Draft profile awaiting review.",
                },
              },
              escalationRules: {
                create: {
                  contactLabel: "Owner",
                  contactValue: email,
                  acknowledgementMsg: "Thanks, a human will follow up shortly.",
                },
              },
            },
          },
        },
      },
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  redirect(industry === IndustryType.RESTAURANT ? "/app/restaurant/onboarding" : "/app");
}

export async function loginUser(formData: FormData) {
  "use server";
  await signIn("credentials", {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    redirectTo: "/console",
  });
}
