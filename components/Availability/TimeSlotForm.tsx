import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, AlertCircle } from "lucide-react"
import { TimeSlot } from "@presentation/pages/availability"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { addMinutes, format } from "date-fns"

interface TimeSlotFormProps {
  onAddTimeSlot: (timeSlot: Omit<TimeSlot, "id">) => void
  disabled?: boolean
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onAddTimeSlot, disabled = false }) => {
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("17:00")
  const [error, setError] = useState<string | null>(null)
  const [singleSession, setSingleSession] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return

    setError(null)

    if (!startTime || (!endTime && !singleSession)) {
      setError("Preencha os horários corretamente.")
      return
    }

    let finalEndTime = endTime

    if (singleSession) {
      // Adiciona 59 minutos apenas para sessão única
      const [h, m] = startTime.split(":").map(Number)
      const startDate = new Date()
      startDate.setHours(h, m, 0, 0)
      const autoEnd = addMinutes(startDate, 59)
      finalEndTime = format(autoEnd, "HH:mm")
    } else {
      if (startTime >= endTime) {
        setError("O horário inicial deve ser menor que o horário final.")
        return
      }
      const [h, m] = endTime.split(":").map(Number)
      const endDate = new Date()
      endDate.setHours(h, m, 0, 0)
      const autoEnd = addMinutes(endDate, 59)
      finalEndTime = format(autoEnd, "HH:mm")
    }

    onAddTimeSlot({ startTime, endTime: finalEndTime })

    // Reset
    setStartTime("08:00")
    setEndTime("17:00")
    setSingleSession(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {disabled && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data passada</AlertTitle>
          <AlertDescription>Não é possível alterar horários de dias anteriores.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-time-modal">1ª Sessão</Label>
            <Input
              id="start-time-modal"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="end-time-modal">
              Última Sessão{" "}
              {singleSession && (
                <span className="hidden lg:inline text-sm text-muted-foreground">(automático)</span>
              )}
            </Label>
            <Input
              id="end-time-modal"
              type="time"
              value={singleSession ? format(addMinutes(new Date(`1970-01-01T${startTime}:00`), 59), "HH:mm") : endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={disabled || singleSession}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="single-session-modal"
            checked={singleSession}
            onCheckedChange={(checked) => setSingleSession(!!checked)}
          />
          <Label htmlFor="single-session-modal">Sessão única (1h padrão)</Label>
        </div>

        <Button type="submit" variant="outline" className="w-full" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Horário
        </Button>
      </form>
    </div>
  )
}

export default TimeSlotForm
