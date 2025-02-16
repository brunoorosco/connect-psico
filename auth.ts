import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "./lib/db";
import { findUserbyEmail } from "./services";
import { isTwoFactorAutenticationEnabled } from "./services/auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update: update,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/auth/login",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token", // Defina explicitamente o nome do cookie
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Apenas para produção
        sameSite: "lax", // Ajuste conforme necessário
      },
    },
  },
  callbacks: {
    async signIn({ user, email, account, profile }) {
      if (
        account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        return true;
      }
      if (user.email) {
        const registeredUser = await findUserbyEmail(user?.email);
        if (!registeredUser?.emailVerified) return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger && trigger === "update" && session) {
        return token;
      }
      if (user) {
        // User is available during sign-in
        if (user.id) {
          const isTwoFactorEnabled = await isTwoFactorAutenticationEnabled(
            user.id
          );
          token.isTwoFactorEnabled = isTwoFactorEnabled;
          token.role = user.role || UserRole.DEFAULT;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        session.user.role = token.role.toString();
      }
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
