// lib/money.ts
export function toCents(amountBRL: number): number {
  return Math.round(amountBRL * 100)
}

export function toBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function applyPlatformFee(grossCents: number, platformPct = 0.1): number {
  const fee = Math.round(grossCents * platformPct)
  return Math.max(0, grossCents - fee)
}
