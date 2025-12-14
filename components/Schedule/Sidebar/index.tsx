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
  isOpen: boolean
  onClose: () => void
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
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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
    </>
  )
}
