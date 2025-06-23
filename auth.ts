import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "./lib/db";
import { findUserbyEmail } from "./services";
import { isProfileCompleteDb, isTwoFactorAutenticationEnabled } from "./services/auth";

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
      console.log("signIn", user);
      if (account && (account.provider === "google" || account.provider === "apple")) {
        const isNewUser = await prisma.user.findUnique({
          where: {
            email: user.email as string,
          },
          include: {
            Account:{
              select:{
                isNewProfile:true
              }
            }
          }
        });
        console.log("isNewUser", isNewUser);
        if (isNewUser && !isNewUser?.Account[0].isNewProfile) {        
          return `/onboarding/${user.id}`;
        }
        return true
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
          const [isTwoFactorEnabled, isProfileComplete] = await Promise.all([
            isTwoFactorAutenticationEnabled(user.id),
            isProfileCompleteDb(user.id),
          ]);
          token.isTwoFactorEnabled = isTwoFactorEnabled;
          token.isProfileCompleted = isProfileComplete;
          token.role = user.role || UserRole.DEFAULT;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // if (token.role) {
      //   session.user.role = token.role.toString();
      // }
      // session.user.id = token.sub as string;
      // session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      // session.user.isProfileCompleted = token.isProfileCompleted;
      // return session;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          role: token.role as UserRole,
          isTwoFactorEnabled: token.isTwoFactorEnabled,
          isProfileCompleted: token.isProfileCompleted,
        },
      };
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
