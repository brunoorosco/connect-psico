import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
type UserRole = "ADMIN" | "DEFAULT" | "SUPERVISOR";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role: string;
      isTwoFactorEnabled?: boolean;
      isProfileCompleted?: boolean;
      isNewProfile?: boolean;
      crm?: string
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    role: string;
    isProfileCompleted?: boolean;
    isTwoFactorEnabled?: boolean;
    crm?: string
  }
  interface JWT {
    role: string;
    isProfileCompleted?: boolean;
    isTwoFactorEnabled?: boolean;
    }
}

declare module "next/server" {
  interface NextRequest {
    auth?: Session;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    isTwoFactorEnabled?: boolean;
    isProfileCompleted?: boolean;
    crm?: string
  }
}
