// src/components/CallFloatingWindow.tsx
"use client"

import { useEffect, useRef } from "react"
import { PhoneOff, Maximize2 } from "lucide-react"
import { useCallStore } from "@/infra/stores/useCallStore"
import { useRouter } from "next/navigation"

export function CallFloatingWindow() {
  const { minimized, inCall, localStream, remoteStream, setMinimized } = useCallStore()
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  if (!inCall || !minimized) return null

  return (
    <div className="fixed bottom-4 right-4 w-64 h-40 bg-black rounded-lg shadow-xl overflow-hidden z-[9999]">
      {/* Mostra o remoto se existir, senão o local */}
      <video ref={remoteRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      {!remoteStream && (
        <video ref={localRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}

      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        <button
          onClick={() => {
            setMinimized(false)
            // volte para a rota da call (ajuste o path conforme seu app)
            router.back() // ou router.push(`/video/${roomId}`)
          }}
          className="p-2 bg-white/30 text-white rounded-full"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={() => {
            // aqui você pode acessar o leaveCall via um singleton/global
            // ou via um callback salvo no store (ex: setLeaveCall(fn))
            // para simplificar, você pode emitir um evento pelo socket ou usar outro store.
            // Ex: useCallStore.getState().leaveCall()
            // (adicione leaveCall no store se quiser acessá-lo aqui)
          }}
          className="p-2 bg-red-600 text-white rounded-full"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  )
}
