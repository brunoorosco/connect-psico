import { Button } from "@components/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDaysUTC, formatYMD } from "./helpers"

export function WeekNavigator({
  weekStartUTC,
  onPrev,
  onNext,
  disablePrev,
}: {
  weekStartUTC: Date
  onPrev: () => void
  onNext: () => void
  disablePrev?: boolean
}) {
  const end = addDaysUTC(weekStartUTC, 4)
  const label = `${formatYMD(weekStartUTC)} → ${formatYMD(end)}`
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">Semana: {label}</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={disablePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
