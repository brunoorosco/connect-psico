import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
type UserRole = "ADMIN" | "DEFAULT" | "SUPERVISOR";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role: string;
      isTwoFactorEnabled?: boolean;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    role: string;
    isTwoFactorEnabled?: boolean;
  }
  interface JWT {
    role: string;
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
  }
}
