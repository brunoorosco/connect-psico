"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ptBR } from "date-fns/locale"
import { IScheduleButton } from "./types"
import { formatInTimeZone } from "date-fns-tz"
import { handleAppointment } from "../agedamentos/createAppoinment"
import { env } from "@/config/application"
import { getValidTaxId } from "@/utils/taxId"

export function ScheduleButton({
  selectedSlot,
  userId,
  professional,
  onSuccess,
  paymentMethod,
  errorPayment,
  setErrorPayment,
  pixCpf,
  onCpfError,
}: IScheduleButton & {
  errorPayment: boolean
  setErrorPayment: (v: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (!paymentMethod) {
      setErrorPayment(true)
      return
    }

    let taxId: string | undefined
    if (paymentMethod === "pix") {
      const validTaxId = getValidTaxId(pixCpf)
      if (!validTaxId) {
        onCpfError("Informe um CPF válido para gerar o pagamento via PIX.")
        return
      }
      taxId = validTaxId
      onCpfError(null)
    } else {
      onCpfError(null)
    }

    setIsLoading(true)
    try {
      const result = await handleAppointment({
        patientId: userId,
        professional,
        selectedSlot,
        paymentMethod,
        onSuccess,
        taxId,
      })

      if (result?.payment?.type === "CREDIT_CARD" && result.payment.checkoutUrl) {
        window.open(result.payment.checkoutUrl, "_blank", "noopener")
      }

      if (result?.payment?.type === "PIX" && result.payment.qrCodeText) {
        router.push(`/copy?code=${encodeURIComponent(result.payment.qrCodeText)}`)
      }

      setErrorPayment(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Button
        className="w-full bg-primary text-gray-50 hover:bg-therapy-tertiary"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "Aguardando..." : "Finalizar agendamento"}
      </Button>

      {errorPayment && (
        <Alert variant="destructive" className="mt-3">
          <AlertTitle className="font-sans">Forma de pagamento não selecionada</AlertTitle>
          <AlertDescription className="font-sans">
            Por favor, escolha entre PIX ou Cartão de Crédito antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-center mt-2 text-muted-foreground">
        {formatInTimeZone(selectedSlot.start, env.timezone, "dd 'de' MMMM", { locale: ptBR })} às{" "}
        {formatInTimeZone(selectedSlot.start, env.timezone, "HH:mm")}
      </p>
    </div>
  )
}
