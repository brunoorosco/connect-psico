import React, { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectedSlot } from "./types"

interface AppointmentModalProps {
  isOpen: boolean
  selectedSlot: SelectedSlot | null
  onClose: () => void
  onSubmit: (data: any) => void
  patients?: any[]
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  selectedSlot,
  onClose,
  onSubmit,
  patients = []
}) => {
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    notes: "",
    duration: "60",
    roomId: ""
  })

  // Initialize form when slot changes
  useEffect(() => {
    if (selectedSlot) {
      // Format date YYYY-MM-DD for input type=date
      let dateStr = ""
      if (selectedSlot.fullDate) {
        dateStr = selectedSlot.fullDate.toISOString().split('T')[0]
      } else {
        // Fallback if no fullDate (should exist closely)
        const tempDate = new Date()
        tempDate.setDate(selectedSlot.day)
        dateStr = tempDate.toISOString().split('T')[0]
      }

      setFormData(prev => ({
        ...prev,
        date: dateStr,
        time: selectedSlot.time
      }))
    }
  }, [selectedSlot, isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(formData)
  }

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
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </FormField>
            <FormField label="Horário">
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Paciente">
            <Select onValueChange={(val) => setFormData({ ...formData, patientId: val })} value={formData.patientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.userId} value={p.userId}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* <FormSelect label="Profissional" placeholder="Selecione o profissional">
            <SelectItem value="me">Eu (Logado)</SelectItem>
          </FormSelect> */}

          <FormSelect label="Procedimento" placeholder="Selecione o procedimento">
            <SelectItem value="consulta">Consulta</SelectItem>
          </FormSelect>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duração (minutos)">
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="60"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              />
            </FormField>
            <FormSelect label="Sala" placeholder="Selecione a sala">
              {/* Populate dynamically if needed */}
              <SelectItem value="sala1">Sala 1</SelectItem>
            </FormSelect>
          </div>

          <FormField label="Observações">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Observações sobre o agendamento..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormField>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleSubmit}
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
