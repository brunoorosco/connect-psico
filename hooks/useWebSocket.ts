"use client"

import { useEffect, useRef, useState } from "react"

export type ChatMessage = {
  from: string
  to: string
  text: string
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export function useWebSocket(userId: string, token: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!token || token === "__") return

    const protocol = location.protocol === "https:" ? "wss" : "ws"
    const urlBase = `${protocol}://localhost:4000?userId=${userId}`
    const ws = new WebSocket(urlBase)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token }))
      setStatus("connected")
    }

    ws.onclose = () => setStatus("disconnected")

    ws.onmessage = async (e) => {
      let raw = e.data instanceof Blob ? await e.data.text() : e.data.toString()
      try {
        const msg = JSON.parse(raw)
        if (msg.type === "auth-success") {
          console.log("✅ Autenticado como", msg.userId)
        } else if (msg.type === "chat") {
          setMessages((prev) => [...prev, msg])
        } else if (msg.type === "auth-failed") {
          console.warn("❌ Falha na autenticação")
        }
      } catch (err) {
        console.error("Mensagem inválida:", raw)
      }
    }

    return () => {
      ws.close()
    }
  }, [token])

  const send = (to: string, text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", to, text }))
    }
  }

  return { messages, status, send }
}
