"use server"

import { prisma } from "@/lib/db"

export async function getStatusPaymentPix(qrcode: string) {  
  return await prisma.payment.findFirst({
    where: { qrCodeText: qrcode },
    select: {
      status: true,
      expiresAt: true,
    },
  })
}
