import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Appointment } from "./types"
import { getStatusText, getStatusColor } from "@/utils/appointmentUtils"

interface AppointmentDrawerProps {
  isOpen: boolean
  appointment: Appointment | null
  onClose: () => void
}

export const AppointmentDrawer: React.FC<AppointmentDrawerProps> = ({
  isOpen,
  appointment,
  onClose,
}) => {
  if (!isOpen || !appointment) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40" 
        onClick={onClose} 
      />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes do Agendamento
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>

          {/* Appointment Info */}
          <InfoSection title="Agendamento">
            <InfoField label="Data e Horário">
              {appointment.day}/11/2025 - {appointment.startTime} às {appointment.endTime}
            </InfoField>
            <InfoField label="Profissional">{appointment.professional}</InfoField>
            <InfoField label="Procedimento">{appointment.procedure}</InfoField>
            <InfoField label="Sala">{appointment.room}</InfoField>
            {appointment.notes && (
              <InfoField label="Observações">{appointment.notes}</InfoField>
            )}
          </InfoSection>

          <div className="border-t border-gray-200" />

          {/* Patient Info */}
          <InfoSection title="Paciente">
            <InfoField label="Nome">{appointment.patient.name}</InfoField>
            <InfoField label="Email">{appointment.patient.email}</InfoField>
            <InfoField label="Telefone">{appointment.patient.phone}</InfoField>
            <InfoField label="CPF">{appointment.patient.cpf}</InfoField>
            <InfoField label="Data de Nascimento">{appointment.patient.birthDate}</InfoField>
            <InfoField label="Endereço">{appointment.patient.address}</InfoField>
          </InfoSection>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Editar Agendamento
            </Button>
            <Button variant="outline" className="w-full">
              Ver Prontuário
            </Button>
            {appointment.status !== "cancelled" && (
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancelar Agendamento
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Componentes auxiliares
const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
)

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ 
  label, 
  children 
}) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <p className="text-sm font-medium text-gray-900">{children}</p>
  </div>
)
