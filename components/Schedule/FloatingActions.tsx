import React from "react"
import { Plus } from "lucide-react"

interface FloatingActionsProps {
  onNewAppointment: () => void
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ 
  onNewAppointment 
}) => {
  return (
    <button
      onClick={onNewAppointment}
      className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
