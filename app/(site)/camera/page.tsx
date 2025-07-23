"use client"

import { useEffect, useRef } from "react"

export default function TestCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (e) {
        console.error("Erro testando câmera:", e)
      }
    }

    start()
  }, [])

  return <video ref={videoRef} autoPlay muted playsInline className="w-96 h-72 bg-black" />
}
