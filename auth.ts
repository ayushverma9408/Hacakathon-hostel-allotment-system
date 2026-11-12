import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validation/auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await getPrisma().user.findUnique({
          where: { email }
        });

        if (!user || !user.isActive || !user.passwordHash) return null;

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "ADMIN" | "WARDEN" | "STAFF" | undefined) ?? "STAFF";
      }
      return session;
    }
  }
});
