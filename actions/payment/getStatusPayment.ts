"use server"

import { prisma } from "@/lib/db"

const paymentCache = new Map<string, any>()

export async function getStatusPaymentPix(qrcode: string) {
  if (paymentCache.has(qrcode)) {
    return paymentCache.get(qrcode)
  }
  
  const data = await prisma.payment.findFirst({
    where: { qrCodeText: qrcode },
    select: {
      status: true,
      expiresAt: true,
    },
  })

  if (data?.status === "PAID") {
    paymentCache.set(qrcode, data)
  }

  return data
}