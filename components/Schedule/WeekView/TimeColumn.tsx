import React from "react"

interface TimeColumnProps {
  timeSlots: string[]
}

export const TimeColumn: React.FC<TimeColumnProps> = ({ timeSlots }) => {
  return (
    <div
      className="border-r border-gray-200 sticky left-0 z-50 bg-white"
      style={{ position: "sticky", left: 0 }}
    >
      {timeSlots.map((time, i) => (
        <div
          key={i}
          className="h-8 border-b border-gray-200 px-2 text-right text-xs text-gray-500 pt-2"
        >
          {time}
        </div>
      ))}
    </div>
  )
}
