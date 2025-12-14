import React from "react"
import { ChevronLeft, ChevronRight, Plus, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  dateRange: string
  onToday: () => void
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({
  dateRange,
  onToday,
  onPreviousWeek,
  onNextWeek,
  onToggleSidebar,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Top Row on Mobile: Navigation */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
              <Menu className="w-6 h-6" />
            </Button>
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hoje
            </button>
            <div className="flex items-center gap-1">
              <button onClick={onPreviousWeek} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={onNextWeek} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions on Mobile (pushed to right) */}
          <div className="flex md:hidden items-center gap-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second Row on Mobile: Date Range & Desktop Actions */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <span className="text-sm font-medium text-gray-900 order-1 md:order-none md:ml-4">
            {dateRange}
          </span>

          <div className="hidden md:flex items-center gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Pedir a Anna
            </Button>
            <Button variant="outline">Semana</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
