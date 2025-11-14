"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle, Copy } from "lucide-react"

export default function CopyPixPage() {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pixCode = params.get("code") || ""
    setCode(pixCode)

    if (pixCode) copyToClipboard(pixCode)
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center px-6 py-4">
      
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="PsicoMais"
          width={160}
          height={60}
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 border border-[#E4E0FF]">
        
        <h1 className="text-2xl font-semibold text-center text-[#4F46E5] mb-3">
          Seu código PIX
        </h1>

        <p className="text-center text-gray-600 mb-6">
          O código foi gerado e está pronto para pagamento.
        </p>

        {code ? (
          <>
            {/* Código PIX */}
            <div
              className="w-full bg-gray-100 p-4 rounded-md text-sm font-mono break-all border border-gray-300 select-all"
            >
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

          </>
        ) : (
          <p className="text-red-600 text-center">
            Nenhum código PIX foi informado.
          </p>
        )}
      </div>

      {/* Rodapé simples */}
      <p className="mt-6 text-sm text-gray-500 text-center">
        PsicoMais • Pagamentos mais fáceis para sua consulta 💜
      </p>
    </div>
  )
}
