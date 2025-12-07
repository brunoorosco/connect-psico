import React from "react"
import { X, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FiltersProps {
  statusFilter: string
  onClearFilters: () => void
  onStatusChange: (value: string) => void
}

export const Filters: React.FC<FiltersProps> = ({
  statusFilter,
  onClearFilters,
  onStatusChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
        <button 
          onClick={onClearFilters}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          Limpar filtros
        </button>
      </div>

      <FilterField label="Status">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md flex items-center justify-between">
            <span className="text-sm text-purple-700">{statusFilter}</span>
            <button className="text-purple-600 hover:text-purple-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </FilterField>

      <FilterSelect label="Profissional" placeholder="Todos" />
      <FilterSelect label="Paciente" placeholder="Todos" />
      <FilterSelect label="Procedimento" placeholder="Todos" />
      <FilterSelect label="Sala de atendimento" placeholder="Todas" />

      <button className="w-full text-left text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center justify-between py-2">
        Opções avançadas
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Sub-componentes internos
const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({ 
  label, 
  children 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
)

const FilterSelect: React.FC<{ label: string; placeholder: string }> = ({ 
  label, 
  placeholder 
}) => (
  <FilterField label={label}>
    <Select defaultValue="todos">
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">{placeholder}</SelectItem>
      </SelectContent>
    </Select>
  </FilterField>
)
