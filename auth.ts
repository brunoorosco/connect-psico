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
  //@ts-ignore
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
            phone: session.phone,
            crp: session.crp,
            username: session.username,
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
          select: {
            role: true,
            isNewProfile: true,
            Professional: { select: { numConselho: true, ufConselho: true, username: true } },
            phone: true
          },
        })

        token.id = user.id
        token.role = userDb?.role || UserRole.DEFAULT
        token.isTwoFactorEnabled = isTwoFactorEnabled
        token.isNewProfile = userDb?.isNewProfile ?? false
        token.phone = userDb?.phone || ""
        if (userDb?.role !== "DEFAULT") {
          token.isProfileCompleted = isProfileComplete
          token.username = userDb?.Professional?.username as string
          token.crp = userDb?.Professional?.ufConselho + "/" + userDb?.Professional?.numConselho
        }
      }

      return token
    },
    async session({ session, token }) {
      const role = token.role as UserRole

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          role: token.role as UserRole,
          isTwoFactorEnabled: token.isTwoFactorEnabled,
          isNewProfile: token.isNewProfile,
          phone: token?.phone,
          ...(role !== "DEFAULT" && {
            crp: token.crp,
            isProfileCompleted: token.isProfileCompleted,
            username: token.username,
          }),
        },
      }
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
})
