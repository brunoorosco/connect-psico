"use server"

import { prisma } from "@/lib/db"

const paymentCache = new Map<string, any>()
const rateLimitMap = new Map<string, number>()

const RATE_LIMIT_MS = 2000

export async function getStatusPaymentPix(qrcode: string) {
  const now = Date.now()

  // Se já estiver no cache, retorna imediatamente
  if (paymentCache.has(qrcode)) {
    return paymentCache.get(qrcode)
  }

  const lastCall = rateLimitMap.get(qrcode)

  // SE RATE LIMITED: retorna o ULTIMO STATUS conhecido,
  // NUNCA null (isso quebra a UI)
  if (lastCall && now - lastCall < RATE_LIMIT_MS) {
    console.log("Rate limit ativado:", qrcode)

    // Se tiver algum status já carregado, retorna ele
    if (paymentCache.has(qrcode)) {
      return paymentCache.get(qrcode)
    }

    // Se ainda não buscou nada, retorna "pending" controlado
    return { status: "PENDING", expiresAt: null }
  }

  // Atualiza o tempo da chamada
  rateLimitMap.set(qrcode, now)

  // Consulta no banco real
  const data = await prisma.payment.findFirst({
    where: { qrCodeText: qrcode },
    select: {
      status: true,
      expiresAt: true,
    },
  })

  // Se estiver pago → salva para sempre no cache
  if (data?.status === "PAID") {
    paymentCache.set(qrcode, data)
  }

  return data
}
