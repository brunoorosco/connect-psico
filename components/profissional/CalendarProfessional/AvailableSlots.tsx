import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { IAvailableSlots } from "./types"
import { env } from "@/config/application"

export function AvailableSlots({ selectedDate, availableSlots, selectedSlot, onSelectSlot }: IAvailableSlots) {
  // const slotsForDate = availableSlots.filter(
  //   ({ start }) => format(start, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  // );
  const slotsForDate = availableSlots.filter(
    ({ start }) => formatInTimeZone(start, env.timezone, "yyyy-MM-dd") === formatInTimeZone(selectedDate, env.timezone, "yyyy-MM-dd")
  )

  if (slotsForDate.length === 0)
    return <p className="text-muted-foreground col-span-3">Não há horários disponíveis para esta data.</p>

  return (
    <>
      {slotsForDate.map((slot) => {
        const isSelected = selectedSlot?.start.getTime() === slot.start.getTime()
        return (
          <Button
            key={String(slot.start.getTime())}
            variant={isSelected ? "default" : "outline"}
            className={isSelected ? "bg-primary text-gray-50 hover:bg-therapy-tertiary" : ""}
            onClick={() => onSelectSlot(slot)}
          >
            {formatInTimeZone(slot.start, env.timezone, "HH:mm")}
          </Button>
        )
      })}
    </>
  )
}
