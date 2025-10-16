import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type Appointment = {
  _id: string
  studentId: string
  supervisorId: string
  date: string
}
interface CalendarProps {
  onSelectSlot?: (date: Date) => void
  appointments?: Appointment[]
  title: string
}

const Calendar: React.FC<CalendarProps> = ({ onSelectSlot, appointments, title }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const generateTimeSlots = () => {
    const slots: Date[] = []
    for (let i = 8; i < 20; i++) {
      slots.push(new Date(selectedDate.setHours(i, 0, 0, 0)))

      slots.push(new Date(selectedDate.setHours(i, 30, 0, 0)))
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const isSlotTaken = (slot: Date) => {
    return appointments?.some((appointment) => new Date(appointment.date).getTime() === slot.getTime())
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full p-2 border rounded bg-background text-foreground"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((slot, index) => (
            <Button
              key={index}
              variant={isSlotTaken(slot) ? "secondary" : "outline"}
              className="w-full"
              onClick={() => onSelectSlot && onSelectSlot(slot)}
              disabled={isSlotTaken(slot)}
            >
              {slot.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Calendar
