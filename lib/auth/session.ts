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

export async function getCurrentUserContext() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      tenantMembers: {
        include: { tenant: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    },
    memberships: dbUser.tenantMembers,
  };
}

export async function requireSystemAdmin() {
  const context = await getCurrentUserContext();
  if (context.user.role !== "SYSTEM_ADMIN") {
    redirect("/app");
  }
  return context;
}

export async function requireTenantAdminContext() {
  const context = await getCurrentUserContext();
  if (context.user.role === "SYSTEM_ADMIN") {
    redirect("/admin");
  }

  const membership = context.memberships[0] ?? null;

  return {
    user: context.user,
    memberships: context.memberships,
    membership,
    tenant: membership?.tenant ?? null,
  };
}

export async function getCurrentTenantContext() {
  return requireTenantAdminContext();
}
