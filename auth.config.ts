import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isProtectedPage =
        pathname === "/" || pathname.startsWith("/admin/");

      if (!isProtectedPage) return true;
      return Boolean(auth?.user);
    }
  },
  providers: []
} satisfies NextAuthConfig;
