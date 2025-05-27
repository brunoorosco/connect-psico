export enum UserRole {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR",
  STUDENT = "STUDENT",
}

export type User = {
  id?: string;
  name: string;
  email: string;
  image: File | string | null;
  telefone?: string
  password: string;
  role: UserRole;
  active: boolean;
  isTwoFactorAuthEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
