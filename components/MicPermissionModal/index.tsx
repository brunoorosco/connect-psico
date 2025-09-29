// components/MicPermissionModal.tsx
"use client"
import React from "react"

export function MicPermissionModal({
  open,
  onClose,
  errorName,
  errorMessage,
}: {
  open: boolean
  onClose: () => void
  errorName?: string | null
  errorMessage?: string | null
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[540px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Permitir acesso ao microfone</h2>
        <p className="mt-2 text-sm text-gray-700">
          O navegador bloqueou o microfone para este site. Libere a permissão e tente novamente.
        </p>

        {(errorName || errorMessage) && (
          <div className="mt-3 rounded-md bg-gray-100 p-2 text-xs text-gray-800">
            {errorName ? <b>{errorName}:</b> : null} {errorMessage}
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium">Como liberar</h3>
          <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
            <li><b>Chrome/Edge/Brave:</b> ícone de cadeado → Permissões → Microfone → <b>Permitir</b> → recarregue.</li>
            <li><b>Firefox:</b> ícone de microfone → <b>Permitir</b>; ou Preferências → Permissões → Microfone.</li>
            <li><b>Safari (macOS/iOS):</b> Preferências/Ajustes → Sites → Microfone → permitir para este site.</li>
          </ul>
          <p className="mt-2 text-xs text-gray-600">A solicitação precisa acontecer após um clique do usuário.</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
