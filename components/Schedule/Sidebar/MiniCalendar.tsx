import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayObject } from "../types"
import { months, weekDays } from "../const"

interface MiniCalendarProps {
  currentDate: Date
  selectedDate: number
  days: DayObject[]
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (day: number) => void
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  days,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-900">
          {months[currentDate.getMonth()]} de {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-1">
          <button onClick={onPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dateObj, i) => (
          <button
            key={i}
            onClick={() => dateObj.isCurrentMonth && onSelectDate(dateObj.day)}
            className={`
              text-center py-2 text-sm rounded-md
              ${!dateObj.isCurrentMonth ? "text-gray-300" : "text-gray-900"}
              ${
                dateObj.day === selectedDate && dateObj.isCurrentMonth
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {dateObj.day}
          </button>
        ))}
      </div>
    </div>
  )
}
