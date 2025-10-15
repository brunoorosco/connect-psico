import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AppointmentModel } from "@/domain/model/appointment"
import { toast } from "@/components/ui/use-toast"
import { useEffect } from "react"
import { TIME_REGEX } from "@/utils/formatMessageTime"
import { mockPatients } from "@components/agenda/mockData"

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  appointmentDate: z.string().min(1, "Selecione uma data"),
  startTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  endTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  notes: z.string().optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentSchema>

export function useAppointmentForm({
  selectedDate,
  editingAppointment,
  onSubmit,
}: {
  selectedDate: Date
  editingAppointment: AppointmentModel | null
  onSubmit: (appointment: Omit<AppointmentModel, "roomId">) => void
}) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "09:30",
      notes: "",
    },
  })

  const patients = mockPatients

  // Carrega dados se estiver editando
  useEffect(() => {
    if (editingAppointment) {
      form.reset({
        patientId: editingAppointment.patient.id,
        appointmentDate: format(new Date(editingAppointment.appointmentDate), "yyyy-MM-dd"),
        startTime: format(new Date(editingAppointment.appointmentDate), "HH:mm"),
        endTime: editingAppointment.duration
          ? format(
              new Date(new Date(editingAppointment.appointmentDate).getTime() + editingAppointment.duration * 60000),
              "HH:mm"
            )
          : "09:30",
        notes: editingAppointment.notes || "",
      })
    } else {
      form.reset()
    }
  }, [editingAppointment, selectedDate])

  const handleSubmit = (values: AppointmentFormValues) => {
    const selectedPatient = patients.find((p) => p.patientId === values.patientId)
    if (!selectedPatient) {
      toast({ title: "Erro", description: "Paciente não encontrado", variant: "destructive" })
      return
    }

    const appointmentDate = new Date(`${values.appointmentDate}T${values.startTime}:00`)
    const [startHour, startMinute] = values.startTime.split(":").map(Number)
    const [endHour, endMinute] = values.endTime.split(":").map(Number)
    const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute)

    const newAppointment: Omit<AppointmentModel, "roomId"> = {
      id: editingAppointment?.id || Math.random(),
      professionalId: "prof1",
      professional: {
        id: "prof1",
        name: "Dr. Fulano",
        telefone: "00000000",
        email: "dr@clinic.com",
      },
      patientId: selectedPatient.patientId,
      patient: {
        id: selectedPatient.patientId,
        name: selectedPatient.name,
        telefone: selectedPatient.phone ?? "",
        email: selectedPatient.email ?? "",
      },
      appointmentDate,
      status: "PENDING",
      createdAt: new Date(),
      notes: values.notes,
      duration,
      isLinkedToMedicalRecord: !!selectedPatient.medicalRecordId,
      review: false,
      tipoAtendimento: "ambos"
    }

    onSubmit(newAppointment)
  }

  return { form, handleSubmit }
}
