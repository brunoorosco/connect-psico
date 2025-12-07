import React from "react"

interface TimeColumnProps {
  timeSlots: string[]
}

export const TimeColumn: React.FC<TimeColumnProps> = ({ timeSlots }) => {
  return (
    <div className="border-r border-gray-200">
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
