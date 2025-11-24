"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle, Copy, Loader2 } from "lucide-react"
import { getStatusPaymentPix } from "@/actions/payment/getStatusPayment"

export default function CopyPixPage() {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"loading" | "pending" | "paid" | "error">("loading")

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const fetchStatus = async (pixCode: string) => {
    try {
      const resp = await getStatusPaymentPix(pixCode)

      if (resp?.status === "PAID") {
        setStatus("paid")
      } else {
        setStatus("pending")
      }

      return resp
    } catch {
      setStatus("error")
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pixCode = params.get("code") || ""

    if (!pixCode) {
      setStatus("error")
      return
    }

    setCode(pixCode)
    fetchStatus(pixCode)

    // Auto-refresh status a cada 5 segundos enquanto estiver pendente
    const interval = setInterval(() => {
      if (status !== "paid") fetchStatus(pixCode)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center px-6 py-4">
      {/* Logo */}
      <div className="mb-6">
        <Image src="/logo.png" alt="PsicoMais" width={160} height={60} />
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 border border-[#E4E0FF]">
        <h1 className="text-2xl font-semibold text-center text-[#4F46E5] mb-3">
          {status === "paid" ? "Pagamento Confirmado!" : "Seu código PIX"}
        </h1>

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="animate-spin h-10 w-10 text-[#4F46E5]" />
            <p className="mt-4 text-gray-500">Verificando pagamento...</p>
          </div>
        )}

        {/* Pagamento aprovado */}
        {status === "paid" && (
          <div className="text-center py-10">
            <CheckCircle className="h-14 w-14 text-green-600 mx-auto" />
            <h2 className="text-xl font-semibold mt-4">Pagamento realizado com sucesso 🎉</h2>
            <p className="text-gray-600 mt-2">
              Obrigado! Sua consulta está confirmada.
            </p>
          </div>
        )}

        {/* Pagamento pendente */}
        {status === "pending" && code && (
          <>
            <p className="text-center text-gray-600 mb-6">
              O código foi gerado e está pronto para pagamento.
            </p>

            {/* Código PIX */}
            <div className="w-full bg-gray-100 p-4 rounded-md text-sm font-mono break-all border border-gray-300 select-all">
              {code}
            </div>

            {/* Feedback */}
            {copied ? (
              <div className="flex items-center gap-2 mt-4 justify-center text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                Código PIX copiado!
              </div>
            ) : (
              <p className="mt-4 text-center text-gray-500">
                Caso não tenha copiado automaticamente, clique abaixo:
              </p>
            )}

            {/* Botão copiar novamente */}
            <button
              onClick={() => copyToClipboard(code)}
              className="mt-4 w-full bg-[#4F46E5] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#473ede] transition"
            >
              <Copy className="h-5 w-5" />
              Copiar novamente
            </button>

            {/* Aguardando pagamento */}
            <div className="mt-6 text-center text-sm text-gray-500 animate-pulse">
              Aguardando confirmação do pagamento...
            </div>
          </>
        )}

        {/* Erro */}
        {status === "error" && (
          <p className="text-red-600 text-center py-6">Erro ao carregar o pagamento.</p>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 text-center">
        PsicoMais • Pagamentos mais fáceis para sua consulta 💜
      </p>
    </div>
  )
}
