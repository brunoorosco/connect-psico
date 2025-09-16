"use client"

import { getProfessionalUsers } from "@/actions/users"
import { getProfessionalWeeklySchedule } from "@/actions/users/getAvailabitiesForWeekByProfessional"
import { getProfessionalSchedule } from "@/actions/users/getGapIntervalsProfessional"
import { getProfessionalById } from "@/actions/users/getProfessionalById"
import { getProfessionalByUsername } from "@/actions/users/getProfissionalsByUsername"
import { ProfessionalModel } from "@/domain/model/professional"
import { Professional } from "@/types/appointment"
import { useCallback, useState, useTransition } from "react"
import useSWR from "swr"

export function useProfessionalsFetcher() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [total, setTotal] = useState(0)
  const [loading, startTransition] = useTransition()

  const fetchProfessionals = useCallback((page = 1, limit = 10, specialty?: string) => {
    startTransition(async () => {
      try {
        const res = await getProfessionalUsers({ page, limit, specialty })
        //@ts-ignore
        setProfessionals(res.data)
        setTotal(res.total)
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error)
        setProfessionals([])
        setTotal(0)
      }
    })
  }, [])

  return { professionals, total, loading, fetchProfessionals }
}
export function useProfessionalsUsername() {
  const [professional, setProfessional] = useState<ProfessionalModel>()
  const [loading, startTransition] = useTransition()

  const getProfissionalByUsername = useCallback((username: string) => {
    startTransition(async () => {
      try {
        const res = await getProfessionalByUsername(username)
        //@ts-ignore
        setProfessional(res)
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error)
      }
    })
  }, [])

  return { professional, loading, getProfissionalByUsername }
}

export const fetchProfessionalSchedule = async (userId: number, date: Date) => {
  return await getProfessionalSchedule(userId, date)
}

export const fetchProfessionalAvailabilityWeek = async (userId: number, date: Date) => {
  console.log(userId, date)
  return await getProfessionalWeeklySchedule(userId, date)
}

const fetchProfessional = (userId: string) => getProfessionalById(userId)

export function useGetProfessionalById(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/professional/${userId}` : null, () =>
    fetchProfessional(userId!)
  )

  return {
    user: data as ProfessionalModel,
    loading: isLoading,
    error,
    refresh: mutate,
  }
}
