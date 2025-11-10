import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ptBR } from "date-fns/locale"
import { IScheduleButton } from "./types"
import { formatInTimeZone } from "date-fns-tz"
import { handleAppointment } from "../agedamentos/createAppoinment"
import { env } from "@/config/application"

export function ScheduleButton({
  selectedSlot,
  userId,
  professional,
  onSuccess,
  paymentMethod,
  errorPayment,
  setErrorPayment,
}: IScheduleButton & {
  errorPayment: boolean
  setErrorPayment: (v: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    console.log(paymentMethod)
    if (!paymentMethod) {
      setErrorPayment(true)
      return
    }

    setIsLoading(true)
    await handleAppointment({
      patientId: userId,
      professional,
      selectedSlot,
      paymentMethod,
      onSuccess,
    })
    setIsLoading(false)
    setErrorPayment(false)
  }

  return (
    <div className="mt-6">
      <Button
        className="w-full bg-therapy-primary text-gray-50 hover:bg-therapy-tertiary"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "Aguardando..." : "Finalizar agendamento"}
      </Button>

      {errorPayment && (
        <Alert variant="destructive" className="mt-3">
          <AlertTitle className="font-sans">Forma de pagamento não selecionada</AlertTitle>
          <AlertDescription className="font-sans">Por favor, escolha entre PIX ou Cartão de Crédito antes de continuar.</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-center mt-2 text-muted-foreground">
        {formatInTimeZone(selectedSlot.start, env.timezone, "dd 'de' MMMM", { locale: ptBR })} às{" "}
        {formatInTimeZone(selectedSlot.start, env.timezone, "HH:mm")}
      </p>
    </div>
  )
}
