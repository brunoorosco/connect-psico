// lib/idempotency.ts
"use server"

import { prisma } from "@/lib/db"

export async function withIdem<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Tenta reservar a chave (falha se já existe)
  try {
    await prisma.idempotencyKey.create({ data: { key } })
  } catch {
    // já foi executado — você pode optar por buscar um "resultado cacheado"
    // ou simplesmente impedir repetição.
    throw new Error("Operação idempotente já processada.")
  }

  try {
    return await fn()
  } catch (err) {
    // Em caso de erro, você pode deletar a chave para permitir reprocessar.
    // (decida conforme o caso)
    await prisma.idempotencyKey.delete({ where: { key } }).catch(() => {})
    throw err
  }
}
