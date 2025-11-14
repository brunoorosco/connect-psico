"use client"

import { useEffect, useState } from "react"

export default function CopyPixPage() {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pixCode = params.get("code") || ""

    setCode(pixCode)

    if (pixCode) {
      navigator.clipboard
        .writeText(pixCode)
        .then(() => {
          setCopied(true)
        })
        .catch(() => {
          setCopied(false)
        })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4">Código PIX</h1>

      {code ? (
        <>
          <div
            className="w-full max-w-xl bg-gray-100 p-4 rounded-md mb-4 text-left font-mono break-all"
            style={{ userSelect: "all" }}
          >
            {code}
          </div>

          {copied ? (
            <p className="text-green-600 font-medium">✔ Código PIX copiado automaticamente!</p>
          ) : (
            <p className="text-yellow-600 font-medium">
              ❗ Não foi possível copiar automaticamente. Você pode copiar manualmente acima.
            </p>
          )}
        </>
      ) : (
        <p className="text-red-600">Nenhum código PIX foi informado.</p>
      )}
    </div>
  )
}
