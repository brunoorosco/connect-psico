"use client"

import { useState, useTransition } from "react"
import { getAppointmentsUsers } from "@/actions/appointments"

// Tipo do item inferido a partir da action do backend
type AppListItem = NonNullable<
  Awaited<ReturnType<typeof getAppointmentsUsers>>["data"]
>[number]

type TUseAppointments = {
  appointments: AppListItem[]
  total: number
  loading: boolean
  fetchAppointments: (page?: number, limit?: number) => void
}

export function useAppointments(): TUseAppointments {
  const [appointments, setAppointments] = useState<AppListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, startTransition] = useTransition()

  const fetchAppointments = (page = 1, limit = 10) => {
    startTransition(() => {
      getAppointmentsUsers({ page, limit })
        .then((res) => {
          setAppointments(res.data ?? [])
          setTotal(res.total ?? 0)
        })
        .catch((err) => {
          console.error("Erro ao buscar consultas:", err)
          setAppointments([])
          setTotal(0)
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
