import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { prisma } from "./lib/db"
import { findUserbyEmail } from "./services"
import { isProfileCompleteDb, isTwoFactorAutenticationEnabled } from "./services/auth"
import jwt from "jsonwebtoken"

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
            email: true,
            name: true,
            Professional: { select: { numConselho: true, ufConselho: true, username: true } },
            BankAccount: { select: { prepaymentEnabled: true } },
            phone: true,
          },
        })

        // ============================================
        // NOVO: Gerar JWT para usar no backend
        // ============================================
        const backendToken = jwt.sign(
          {
            id: user.id,
            email: userDb?.email,
            name: userDb?.name,
            role: userDb?.role,
          },
          process.env.AUTH_SECRET!, // Use o mesmo secret do backend
          {
            expiresIn: "7d", // Mesmo tempo do maxAge da sessão
          },
        )

        token.id = user.id
        token.role = userDb?.role || UserRole.DEFAULT
        token.isTwoFactorEnabled = isTwoFactorEnabled
        token.isNewProfile = userDb?.isNewProfile ?? false
        token.phone = userDb?.phone || ""
        token.accessToken = backendToken
        if (userDb?.role !== "DEFAULT") {
          token.isProfileCompleted = isProfileComplete
          token.username = userDb?.Professional?.username as string
          token.crp = userDb?.Professional?.ufConselho + "/" + userDb?.Professional?.numConselho,
          token.isPrePayment = userDb?.BankAccount[0]?.prepaymentEnabled
        }
      }

      return token
    },
    async session({ session, token }) {
      const role = token.role as UserRole

      return {
        ...session,
        accessToken: token.accessToken, // ← JWT para usar no backend
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
            isPrePayment: token.isPrePayment,
          }),
        },
      }
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
})
