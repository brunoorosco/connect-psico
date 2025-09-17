import { toast } from "sonner"
import { formatInTimeZone } from "date-fns-tz"
import { createAppointment } from "@/actions/appointments"
import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"

const TZ = "America/Sao_Paulo"

interface HandleAppointmentParams {
  patientId: string
  professional: {
    userId: string
    name: string
    phone: string
  }
  selectedSlot: { start: Date }
  onSuccess: () => void
}

export async function handleAppointment({ patientId, professional, selectedSlot, onSuccess }: HandleAppointmentParams) {
  try {
    const result = await createAppointment({
      patientId,
      professionalId: professional.userId,
      appointmentDate: selectedSlot.start,
    })

    if (result.error) {
        toast.error("Erro ao agendar", { description: result.error })
        return
    }
    
    onSuccess()
    toast.success("Agendamento solicitado!", {
      description: `Consulta para ${formatInTimeZone(selectedSlot.start, TZ, "dd/MM/yyyy")} às ${formatInTimeZone(
        selectedSlot.start,
        TZ,
        "HH:mm"
      )}.`,
    })

    await sendMessageApiWhatsapp(
      professional.phone,
      `Oi ${professional.name.split(" ")[0]}. Você tem um novo agendamento. ` +
        `Confira sua agenda na plataforma para maiores detalhes. 😉`
    )

  } catch (err) {
    console.error(err)
    // toast.error("Erro inesperado ao agendar")
  }
}
