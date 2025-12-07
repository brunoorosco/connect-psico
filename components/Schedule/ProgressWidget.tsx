import React from "react"

interface ProgressWidgetProps {
  progress: number
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ progress }) => {
  return (
    <div className="fixed bottom-6 right-24 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-semibold text-gray-900">{progress}%</div>
        <div className="text-sm text-gray-600">Seu progresso</div>
      </div>
    </div>
  )
}
