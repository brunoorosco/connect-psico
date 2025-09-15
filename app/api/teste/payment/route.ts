import { abacatePay } from "@/infra/payments/abacatepay"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const resp = await abacatePay.createPixCharge({
    amountCents: 15000, // R$150,00
    expiresInSec: 600,
    description: "Teste de consulta",
    customer: {
      name: "Paciente Teste",
      cellphone: "(11) 99999-9999",
      email: "paciente@example.com",
      taxId: "123.456.789-01",
    },
    metadata: { externalId: "appt-123" },
  })
  return NextResponse.json(resp)
}
