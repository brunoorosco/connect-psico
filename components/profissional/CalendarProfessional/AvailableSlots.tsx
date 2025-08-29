import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { IAvailableSlots } from "./types"

const TZ = "America/Sao_Paulo"

export function AvailableSlots({ selectedDate, availableSlots, selectedSlot, onSelectSlot }: IAvailableSlots) {
  // const slotsForDate = availableSlots.filter(
  //   ({ start }) => format(start, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  // );
  const slotsForDate = availableSlots.filter(
    ({ start }) => formatInTimeZone(start, TZ, "yyyy-MM-dd") === formatInTimeZone(selectedDate, TZ, "yyyy-MM-dd")
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
            className={isSelected ? "bg-therapy-primary hover:bg-therapy-tertiary" : ""}
            onClick={() => onSelectSlot(slot)}
          >
            {formatInTimeZone(slot.start, TZ, "HH:mm")}
          </Button>
        )
      })}
    </>
  )
}
