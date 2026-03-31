import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function requireTenantIdFromSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role === "SYSTEM_ADMIN") throw new Error("System admin must choose a tenant workspace");

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
    select: { tenantId: true },
  });
  if (!membership) throw new Error("Tenant membership not found");
  return membership.tenantId;
}

export async function ensureTenantAccess(tenantId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role === "SYSTEM_ADMIN") {
    return { tenantId, userId: session.user.id, role: "system_admin" };
  }

  const membership = await prisma.tenantMember.findFirst({
    where: { tenantId, userId: session.user.id },
  });
  if (!membership) throw new Error("Forbidden");
  return membership;
}
