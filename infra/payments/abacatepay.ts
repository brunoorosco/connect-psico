import crypto from "crypto"

type PixChargeInput = {
  amountCents: number
  description?: string
  metadata?: Record<string, any>
  expiresInSec?: number
}

type PixChargeResp = {
  id: string
  checkoutUrl: string
  qrCodeText: string
  expiresAt?: string
}

type RefundInput = {
  providerPaymentId: string
  amountCents: number // total ou parcial
  reason?: string
}

type RefundResp = { id: string; status: "requested" | "processed" | "failed" }

type PayoutInput = {
  amountCents: number
  professionalId: string // ID do usuário/profissional no teu sistema
}

type PayoutResp = { id: string; status: "processing" | "paid" | "failed" }

const ABACATE_BASE_URL = process.env.ABACATEPAY_BASE_URL ?? "https://api.abacatepay.com"
const ABACATE_API_KEY = process.env.ABACATEPAY_API_KEY ?? ""
const ABACATE_WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET ?? "" // para HMAC

if (!ABACATE_API_KEY) {
  console.warn("[abacatepay] ABACATEPAY_API_KEY não configurada.")
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ABACATE_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ABACATE_API_KEY}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`[abacatepay] ${res.status} ${res.statusText} :: ${body}`)
  }
  return res.json() as Promise<T>
}

export const abacatePay = {
  async createPixCharge(input: {
    amountCents: number
    description?: string
    expiresInSec?: number
    metadata?: Record<string, any>
    customer: {
      name: string
      cellphone: string
      email: string
      taxId: string
    }
  }) {
    const payload = {
      amount: input.amountCents,
      expiresIn: input.expiresInSec ?? 1800,
      description: input.description ?? "Consulta psicológica",
      customer: input.customer,
      metadata: input.metadata ?? {},
    }

    return api<{
      id: string
      qrCodeText: string
      qrCodeBase64: string
      expiresAt: string
      checkoutUrl: string
    }>("/v1/pixQrCode/create", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async refund(input: RefundInput): Promise<RefundResp> {
    const payload = {
      amount: input.amountCents,
      reason: input.reason ?? "other",
    }
    return api<RefundResp>(`/v1/charges/${input.providerPaymentId}/refunds`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async createPayout(input: PayoutInput): Promise<PayoutResp> {
    const payload = {
      amount: input.amountCents,
      recipientExternalId: input.professionalId,
      method: "PIX", // ou TED, conforme o gateway
    }
    return api<PayoutResp>("/v1/payouts", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  async checkPixCharge(pixId: string) {
    // supondo que o AbacatePay exige query param ?id= ou algo similar
    const res = await api<{
      id: string
      status: "PENDING" | "PAID" | "EXPIRED" | "REFUNDED"
      amount: number
      createdAt: string
      paidAt?: string
      expiresAt?: string
    }>(`/v1/pixQrCode/check?id=${pixId}`, {
      method: "GET",
    })
    return res
  },
}

export function verifyAbacateSignature(rawBody: string, signatureHeader: string): boolean {
  if (!ABACATE_WEBHOOK_SECRET) {
    console.warn("[abacatepay] ABACATEPAY_WEBHOOK_SECRET não configurado — aceitando sempre (dev).")
    return true
  }
  try {
    // Supondo assinatura HMAC-SHA256 no header: x-abacatepay-signature
    const hmac = crypto.createHmac("sha256", ABACATE_WEBHOOK_SECRET)
    const digest = "sha256=" + hmac.update(rawBody, "utf8").digest("hex")
    // comparação tempo-constante
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}
