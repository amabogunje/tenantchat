import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function requireTenantIdFromSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
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
  const membership = await prisma.tenantMember.findFirst({
    where: { tenantId, userId: session.user.id },
  });
  if (!membership) throw new Error("Forbidden");
  return membership;
}
