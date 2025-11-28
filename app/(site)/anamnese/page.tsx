"use client"
import { getAnamnesisByToken } from "@/actions/anamenesis/createAnamenesis"
import AnamnesisAdultForm from "@presentation/pages/anamenese/adults"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const AnamnesisPage = () => {
  const [showPage, setShowPage] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  const fetchStatus = async (token: string) => {
    try {
      const resp = await getAnamnesisByToken(token)

      if (!resp) {
        toast.error("Token inválido ou expirado!")
        router.push("/")
        return
      }

      setShowPage(true)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao validar token")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("t") || ""

    if (!token) {
      toast.error("Token não encontrado")
      router.push("/")
      return
    }

    fetchStatus(token)
  }, [])

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen text-white"
        style={{
          backgroundImage: "url('/anamnese-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-white border-t-transparent"></div>

        <p className="mt-4 text-lg font-medium drop-shadow-lg">Carregando sua anamnese…</p>
      </div>
    )
  }

  return showPage && <AnamnesisAdultForm />
}

export default AnamnesisPage
