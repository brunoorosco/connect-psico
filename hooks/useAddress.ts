"use client"

import { getProfessionalAddress } from "@/actions/professionals/getAddress"
import { Address } from "@/domain/model/professional"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useAddress(userId: string | undefined) {
  const [data, setData] = useState<Address>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)

    getProfessionalAddress()
      .then((res) => {
        if(!res) return
        setData(res)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Erro ao buscar endereço"))
        toast.error("Erro ao tentar carregar endereço")
      })
      .finally(() => setIsLoading(false))
  }, [userId])

  return { data, isLoading, error }
}
