import { ProfessionalModel } from "@/domain/model/professional"

export interface IAvailableSlots {
  selectedDate: Date
  availableSlots: { start: Date }[]
  selectedSlot: { start: Date } | null
  onSelectSlot: (slot: { start: Date }) => void
}

export interface IScheduleButton {
  selectedSlot: { start: Date }
  userId: string
  professional: ProfessionalModel
  onSuccess: () => void
  disabled?: boolean
  paymentMethod?: "pix" | "credit" | null
  pixCpf: string
  onCpfError: (value: string | null) => void
}

export interface ICalendarProfessional {
  professionalData: ProfessionalModel
}
