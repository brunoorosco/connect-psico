"use client"

import { getProfessionalAddress } from "@/actions/professionals/getAddress"
import { useEffect, useState } from "react"

export function useAddress(userId: string | undefined) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)

    getProfessionalAddress(userId)
      .then((res) => {
        setData(res)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Erro ao buscar endereço"))
      })
      .finally(() => setIsLoading(false))
  }, [userId])

  return { data, isLoading, error }
}
