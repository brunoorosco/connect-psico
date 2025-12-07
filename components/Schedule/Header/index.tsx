import React from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  dateRange: string
  onToday: () => void
  onPreviousWeek: () => void
  onNextWeek: () => void
}

export const Header: React.FC<HeaderProps> = ({
  dateRange,
  onToday,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hoje
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onPreviousWeek} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-900">{dateRange}</span>
            <button onClick={onNextWeek} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Pedir a Anna
          </Button>
          <Button variant="outline">Semana</Button>
        </div>
      </div>
    </div>
  )
}
