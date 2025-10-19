import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ptBR } from "date-fns/locale"
import { IScheduleButton } from "./types"
import { formatInTimeZone } from "date-fns-tz"
import { handleAppointment } from "../agedamentos/createAppoinment"
import { env } from "@/config/application"

export function ScheduleButton({ selectedSlot, userId, professional, onSuccess }: IScheduleButton) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    await handleAppointment({
      patientId: userId,
      professional,
      selectedSlot,
      onSuccess,
    })
    setIsLoading(false)
  }

  return (
    <div className="mt-6">
      <Button
        className="w-full bg-therapy-primary text-gray-50 hover:bg-therapy-tertiary"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "Aguardando..." : "Agendar consulta"}
      </Button>
      <p className="text-xs text-center mt-2 text-muted-foreground">
        {formatInTimeZone(selectedSlot.start, env.timezone, "dd 'de' MMMM", { locale: ptBR })} às{" "}
        {formatInTimeZone(selectedSlot.start, env.timezone, "HH:mm")}
      </p>
    </div>
  )
}
