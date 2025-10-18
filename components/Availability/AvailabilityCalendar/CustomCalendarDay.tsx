import { format, isSameDay, isSameMonth } from "date-fns"
import { Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { ICustomCalendarDay } from "./types"
import { formatInTimeZone } from "date-fns-tz"
const TZ = "America/Sao_Paulo"

// 🕒 Função para padronizar exibição HH:mm
function displayHHmm(input: unknown) {
  if (typeof input === "string" && /^\d{2}:\d{2}$/.test(input)) return input
  const d = input instanceof Date ? input : new Date(String(input))
  if (isNaN(d.valueOf())) return "--:--"
  return formatInTimeZone(d, TZ, "HH:mm")
}

// 🧩 Função principal para formatar o horário conforme regra
function formatTimeSlotDisplay(start: unknown, end: unknown) {
  const startStr = displayHHmm(start)
  const endStr = displayHHmm(end)

  // pegar apenas a hora (HH)
  const startHour = startStr.split(":")[0]
  const endHour = endStr.split(":")[0]

  // ✅ Se for a mesma hora → sessão única
  if (startHour === endHour) {
    return startStr
  }

  // ✅ Se for diferente → remove minutos e mostra apenas hora cheia
  return `${startHour}:00 - ${endHour}:00`
}

export function CustomCalendarDay({
  date,
  selectedDate,
  getAvailabilityForDate,
  onClick,
}: ICustomCalendarDay) {
  const inMonth = isSameMonth(date, selectedDate)
  const timeSlots = inMonth ? getAvailabilityForDate(date) : []

  const isToday = isSameDay(date, new Date())
  const hasAvailability = timeSlots.length > 0

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full cursor-pointer group"
      onClick={() => onClick(date)}
    >
      <div className={cn("text-sm font-medium mb-1", isToday && "font-bold")}>
        {format(date, "d")}
      </div>

      {hasAvailability && (
        <div className="flex flex-col items-center space-y-1 text-[10px] text-green-700 font-medium">
          {timeSlots.slice(0, 2).map((slot, i) => (
            <div key={i} className="h-2">
              {formatTimeSlotDisplay((slot as any).startTime, (slot as any).endTime)}
            </div>
          ))}
          {timeSlots.length > 2 && <div>+{timeSlots.length - 2} mais</div>}
        </div>
      )}

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  )
}
