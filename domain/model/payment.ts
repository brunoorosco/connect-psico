export type PaymentModel = {
  id: string
  appointmentId: number
  status: "PENDING" | "PAID" | "REFUNDED" | "CANCELED" | "FAILED"
  type: "PIX" | "CREDIT_CARD" | "CASH" | "DEBIT_CARD" | "TRANSFER_BANK"
  provider: string
  providerPaymentId: string
  checkoutUrl?: string
  qrCodeText?: string
  expiresAt?: Date
  amountCents: number
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}
