import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedToken = token as typeof token & { userId?: string; userRole?: string };
        typedToken.userId = user.id;
        typedToken.userRole = (user as typeof user & { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      const typedToken = token as typeof token & { userId?: string; userRole?: string };
      if (session.user && typedToken.userId) {
        session.user.id = typedToken.userId;
        session.user.role = typedToken.userRole === "SYSTEM_ADMIN" ? "SYSTEM_ADMIN" : "TENANT_ADMIN";
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;
        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SYSTEM_ADMIN" | "TENANT_ADMIN";
      email?: string | null;
      name?: string | null;
    };
  }
}
