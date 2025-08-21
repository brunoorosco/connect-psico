import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { prisma } from "./lib/db"
import { findUserbyEmail } from "./services"
import { isProfileCompleteDb, isTwoFactorAutenticationEnabled } from "./services/auth"

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
      if (account && (account.provider === "google" || account.provider === "apple")) {
        return true
      }
      if (user.email) {
        const registeredUser = await findUserbyEmail(user?.email)
        if (!registeredUser?.emailVerified) return false
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return {
          ...token,
          ...session,
          session: {
            role: session.role ?? token.role,
            isTwoFactorEnabled: session.isTwoFactorEnabled ?? token.isTwoFactorEnabled,
            isProfileCompleted: session.isProfileCompleted ?? token.isProfileCompleted,
            isNewProfile: session.isNewProfile ?? token.isNewProfile,
            crm: session.crm,
          },
        }
      }

      if (user) {
        const [isTwoFactorEnabled, isProfileComplete] = await Promise.all([
          isTwoFactorAutenticationEnabled(user.id as string),
          isProfileCompleteDb(user.id as string),
        ])

        const userDb = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, isNewProfile: true, Professional: { select: { numConselho: true, ufConselho: true } } },
        })

        token.id = user.id
        token.role = userDb?.role || UserRole.DEFAULT
        token.isProfileCompleted = isProfileComplete
        token.isTwoFactorEnabled = isTwoFactorEnabled
        token.isNewProfile = userDb?.isNewProfile ?? false
        token.crm = userDb?.Professional?.numConselho + "/" + userDb?.Professional?.ufConselho
      }

      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          role: token.role as UserRole,
          isTwoFactorEnabled: token.isTwoFactorEnabled,
          isProfileCompleted: token.isProfileCompleted,
          isNewProfile: token.isNewProfile,
          crm: token.crm,
        },
      }
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
})
