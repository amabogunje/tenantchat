import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user;
}

export async function getCurrentTenantContext() {
  const user = await requireUser();
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });
  return { user, membership, tenant: membership?.tenant ?? null };
}
