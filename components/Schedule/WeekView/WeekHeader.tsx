import React from "react"
import { WeekDate } from "../types"

interface WeekHeaderProps {
  weekDates: WeekDate[]
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({ weekDates }) => {
  return (
    <div className="grid grid-cols-[50px,repeat(7,minmax(120px,1fr))] border-b border-gray-200 sticky top-0 z-30 bg-white">
      <div className="border-r border-gray-200 bg-gray-50 bg-hatched sticky left-0 z-40" />
      {weekDates.map((date, i) => (
        <div
          key={i}
          className={`text-center py-2 border-r border-gray-200 ${date.isToday ? "bg-purple-100" : "bg-gray-50"
            }`}
        >
          <div className="text-xs font-medium mb-1 text-gray-500">
            <span
              className={`text-xl font-medium mb-1 ${date.isToday
                  ? "bg-purple-600 text-white rounded-sm p-1"
                  : "text-gray-500"
                }`}
            >
              {date.day}
            </span>
            <span className="ml-1 text-[0.9rem]">{date.weekDay}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
