// src/actions/bankAccount.action.ts
"use server"

import { auth } from "@/auth"
import { BankAccountCreateSchema, BankAccountUpdateSchema } from "@/domain/model/bankAccount"
import { excluir, findByUserId, listByUser, update, upsert } from "@services/bankAccountService"
import { revalidatePath } from "next/cache"

export async function updateBankAccountAction(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = BankAccountUpdateSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() }
  }

  const account = await update(id, parsed.data)
  revalidatePath("/dashboard/bank-accounts")
  return { success: true, data: account }
}

export async function deleteBankAccountAction(id: number) {
  await excluir(id)
  revalidatePath("/dashboard/bank-accounts")
  return { success: true }
}

export async function saveBankAccountAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado." }
  }

  const raw = Object.fromEntries(formData)
  const parsed = BankAccountCreateSchema.safeParse({
    accountType: raw.accountType,
    bankName: raw.bankName,
    branchNumber: raw.agency, // mapeando seu campo "agency"
    accountNumber: raw.account,
    pixKey: raw.pixKey,
    userId: session.user.id,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  await upsert(session.user.id, parsed.data)

  revalidatePath("/professional-dashboard/payment-settings")

  return { success: true }
}

export async function getBankAccountAction(userId: string) {
  try {
    const account = await findByUserId(userId)
    return { success: true, data: account }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Erro ao buscar conta bancária" }
  }
}