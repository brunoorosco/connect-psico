import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectedSlot } from "./types"

interface AppointmentModalProps {
  isOpen: boolean
  selectedSlot: SelectedSlot | null
  onClose: () => void
  onSubmit: () => void
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  selectedSlot,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Novo Agendamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                defaultValue={selectedSlot ? `2025-11-${String(selectedSlot.day).padStart(2, "0")}` : ""}
              />
            </FormField>
            <FormField label="Horário">
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                defaultValue={selectedSlot?.time || ""}
              />
            </FormField>
          </div>

          <FormSelect label="Paciente" placeholder="Selecione o paciente">
            <SelectItem value="joao">João Silva</SelectItem>
            <SelectItem value="maria">Maria Santos</SelectItem>
            <SelectItem value="pedro">Pedro Costa</SelectItem>
          </FormSelect>

          <FormSelect label="Profissional" placeholder="Selecione o profissional">
            <SelectItem value="carlos">Dr. Carlos Mendes</SelectItem>
            <SelectItem value="ana">Dra. Ana Paula</SelectItem>
          </FormSelect>

          <FormSelect label="Procedimento" placeholder="Selecione o procedimento">
            <SelectItem value="consulta">Consulta Inicial</SelectItem>
            <SelectItem value="retorno">Retorno</SelectItem>
            <SelectItem value="avaliacao">Avaliação</SelectItem>
            <SelectItem value="tratamento">Tratamento</SelectItem>
          </FormSelect>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duração (minutos)">
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="60"
                defaultValue="60"
              />
            </FormField>
            <FormSelect label="Sala" placeholder="Selecione a sala">
              <SelectItem value="sala1">Sala 1</SelectItem>
              <SelectItem value="sala2">Sala 2</SelectItem>
              <SelectItem value="sala3">Sala 3</SelectItem>
            </FormSelect>
          </div>

          <FormField label="Observações">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Observações sobre o agendamento..."
            />
          </FormField>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={onSubmit}
          >
            Criar Agendamento
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares internos
const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ 
  label, 
  children 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
)

const FormSelect: React.FC<{ 
  label: string
  placeholder: string
  children: React.ReactNode 
}> = ({ label, placeholder, children }) => (
  <FormField label={label}>
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  </FormField>
)
