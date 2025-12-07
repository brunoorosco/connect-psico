import React from "react"
import { MiniCalendar } from "./MiniCalendar"
import { Filters } from "./Filters"
import { DayObject } from "../types"

interface SidebarProps {
  currentDate: Date
  selectedDate: number
  days: DayObject[]
  statusFilter: string
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (day: number) => void
  onClearFilters: () => void
  onStatusChange: (value: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDate,
  selectedDate,
  days,
  statusFilter,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
  onClearFilters,
  onStatusChange,
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <MiniCalendar
        currentDate={currentDate}
        selectedDate={selectedDate}
        days={days}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onSelectDate={onSelectDate}
      />
      <Filters
        statusFilter={statusFilter}
        onClearFilters={onClearFilters}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}
