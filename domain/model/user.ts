import * as z from "zod"
export enum UserRole {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR",
  STUDENT = "STUDENT",
}

export type User = {
  id?: string
  name: string
  email: string
  image: File | string | null
  phone?: string
  password: string
  role: UserRole
  active: boolean
  isTwoFactorAuthEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  image: z.string().optional(),
  telefone: z.string(),
  password: z.string(),
})

export const userSchemaProfile = userSchema.extend({
  id: userSchema.shape.id.optional(),
  password: userSchema.shape.password.optional(),
})

export type TUser = z.infer<typeof userSchemaProfile>
