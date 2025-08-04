import { getAppointmentsByPatient, getAppointmentsByUserId, getAppointmentsUsers } from "@/actions/appointments"
import { AppointmentModel } from "@/domain/model/appointment"
import { useEffect, useState, useTransition } from "react"

type TUseAppointments = {
  appointments: AppointmentModel[]
  total: number
  loading: boolean
  fetchAppointments: (page?: number, limit?: number) => void
}

export function useAppointments(): TUseAppointments {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, startTransition] = useTransition()

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(() => {
      getAppointmentsUsers({ page, limit }).then((res) => {
        setAppointments(res.data ?? [])
        setTotal(res.total ?? 0)
      })
    })
  }

  return {
    appointments,
    total,
    loading,
    fetchAppointments,
  }
}

export function useAppointmentsByPatient() {
  const [appointments, setAppointments] = useState<any>([])
  const [total, setTotal] = useState(0)
  const [loading, startTransition] = useTransition()

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getAppointmentsByPatient({ page, limit })
      setAppointments(res?? [])
      setTotal(res.total ?? 0)
    })
  }
  return { appointments: appointments.data, total, loading, fetchAppointments }
}

export function useAppointmentsByProfessional(): TUseAppointments {
  const [appointments, setAppointments] = useState<AppointmentModel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, startTransition] = useTransition()

  const fetchAppointments = async (page = 1, limit = 10) => {
    startTransition(async () => {
      const res = await getAppointmentsUsers({ page, limit })
      setAppointments(res.data ?? [])
      setTotal(res.total ?? 0)
    })
  }
  return { appointments, total, loading, fetchAppointments }
}

export const usePatientAppointments = (userId: string) => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchAppointments = (page = 1, limit = 10) => {
    if (!userId) return
    startTransition(() => {
      getAppointmentsByUserId({ userId, page, limit })
        .then((res) => setAppointments(res.data))
        .catch((err) => console.error("Erro ao buscar consultas:", err))
    })
  }

  useEffect(() => {
    fetchAppointments() // busca inicial
  }, [userId])

  return {
    appointments,
    isLoading: isPending,
    fetchAppointments,
  }
}
