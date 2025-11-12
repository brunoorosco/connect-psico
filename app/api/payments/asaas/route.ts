// app/api/asaas/route.ts - Exemplo de API Route
import { env } from "@/config/application"
import { AsaasService } from "@/infra/payments/asaas"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const asaasService = new AsaasService({
    apiKey: env.apikeyASAAS!,
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  })
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "criar_link_pagamento":
        const link = await asaasService.criarLinkPagamento(data)
        return NextResponse.json({ success: true, data: link })

      case "criar_cobranca_pix":
        const pix = await asaasService.criarCobrancaPix(data)
        return NextResponse.json({ success: true, data: pix })

      case "pagar_cartao":
        const cartao = await asaasService.pagarComCartao(data)
        return NextResponse.json({ success: true, data: cartao })

      case "estornar":
        const estorno = await asaasService.estornarCobranca(data.paymentId, data.value, data.description)
        return NextResponse.json({ success: true, data: estorno })

      case "buscar_cobranca":
        const cobranca = await asaasService.buscarCobranca(data.paymentId)
        return NextResponse.json({ success: true, data: cobranca })

      default:
        return NextResponse.json({ success: false, error: "Ação inválida" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
