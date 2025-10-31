import { z } from "zod"

// enum Zod simples
export const AccountTypeEnum = z.enum(["CHECKING", "SAVINGS"])
export type BankAccountModel = z.infer<typeof AccountTypeEnum>

// Validações auxiliares
const branchNumberSchema = z
  .string()
  .trim()
  .max(10, "Agência muito longa")
  .regex(/^[0-9\-]+$/, "Agência só pode conter números e '-'")
  .optional()

const accountNumberSchema = z
  .string()
  .trim()
  .max(30, "Número da conta muito longo")
  .regex(/^[0-9\-\.]+$/, "Número da conta inválido")
  .optional()

const bankNameSchema = z.string().trim().min(1, "Nome do banco é obrigatório").max(100)

// chave PIX: opcional — permite CPF, email, telefone ou chave aleatória
const pixKeySchema = z
  .string()
  .trim()
  .max(20)
  .optional()
  .refine((val) => {
    if (!val) return true
    // validações básicas (pode melhorar: detectar formato CPF, e-mail, telefone, UUID)
    return val.length > 0
  }, "Chave PIX inválida")

// Schema para criar
export const BankAccountCreateSchema = z.object({
  accountType: AccountTypeEnum,
  bankName: bankNameSchema,
  branchNumber: branchNumberSchema,
  accountNumber: accountNumberSchema,
  pixKey: pixKeySchema,
  userId: z.string().cuid(), // se usar UUID
})

// Schema para update (parcial)
export const BankAccountUpdateSchema = BankAccountCreateSchema.partial()

// Schema de resposta (o que o servidor retorna)
export const BankAccountResponseSchema = z.object({
  id: z.number(),
  accountType: AccountTypeEnum,
  bankName: bankNameSchema,
  branchNumber: branchNumberSchema,
  accountNumber: accountNumberSchema,
  pixKey: pixKeySchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().cuid(),
})

// Tipagens TS inferidas
export type BankAccountCreateInput = z.infer<typeof BankAccountCreateSchema>
export type BankAccountUpdateInput = z.infer<typeof BankAccountUpdateSchema>
export type BankAccountResponse = z.infer<typeof BankAccountResponseSchema>
