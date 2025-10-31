// src/services/bankAccount.service.ts
"use server"

import { BankAccountCreateInput, BankAccountUpdateInput } from "@/domain/model/bankAccount"
import { prisma } from "@/lib/db"

export async function update(id: number, data: BankAccountUpdateInput) {
  return await prisma.bankAccount.update({
    where: { id },
    data,
  })
}

export async function excluir(id: number) {
  return await prisma.bankAccount.delete({
    where: { id },
  })
}

export async function findById(id: number) {
  return await prisma.bankAccount.findUnique({
    where: { id },
  })
}

export async function listByUser(userId: string) {
  return await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export async function upsert(userId: string, data: BankAccountCreateInput) {
  const existing = await prisma.bankAccount.findFirst({
    where: { userId, accountType: data.accountType }, // pode usar outro campo como critério
  })

  if (existing) {
    return prisma.bankAccount.update({
      where: { id: existing.id },
      data,
    })
  } else {
    return prisma.bankAccount.create({
      //@ts-ignore
      data: { ...data, userId },
    })
  }
}

export async function findByUserId(userId: string) {
  const resp = await prisma.bankAccount.findFirst({ where: { userId } })
  return resp
}
