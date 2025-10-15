import { AppointmentModel } from "@/domain/model/appointment"
import { AppointmentFormValues } from "@hooks/useAppointmentForm"
import { UseFormReturn } from "react-hook-form"

export interface IAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (appointment: Omit<AppointmentModel,"roomId">) => void
  selectedDate: Date
  editingAppointment: AppointmentModel | null
}

export interface IAppointmentForm {
  onSubmit: (appointment: Omit<AppointmentModel, "roomId">) => void
  onCancel: () => void
  selectedDate: Date
  editingAppointment: AppointmentModel | null
}

export interface IFormPatientField {
  form: UseFormReturn<AppointmentFormValues>
}
