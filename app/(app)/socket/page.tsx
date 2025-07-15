"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useWebSocket } from "@hooks/useWebSocket"
import { getAccessTokenAction, sendMessageAction } from "@/actions/messages"

export default function ChatPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")
  const [toUserId, setToUserId] = useState("")
  const [input, setInput] = useState("")

  useEffect(() => {
    const fetchToken = async () => {
      const result = await getAccessTokenAction()
      if (result.ok) {
        setUserId(result.userId as string)
        setToken(result.accessToken as string)
      }
    }

    fetchToken()
  }, [])

  const socketReady = !!(userId && token)
  const { messages, status, send } = useWebSocket(
    socketReady ? userId : "__",
    socketReady ? token : "__"
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    const message = input.trim()
    if (!message || !toUserId || !userId) return

    if (status === "connected") {
      send(toUserId, message)
    }
    setInput("")
  }

  if (sessionStatus === "loading" || !token) {
    return <p>Carregando sessão e autenticando...</p>
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-lg font-bold mb-2">Chat 1:1</h2>

      <div className="mb-4">
        <label className="block text-sm">Conversar com (userId):</label>
        <input
          type="text"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 rounded">
        {messages.length === 0 && <p className="text-sm text-gray-500">Nenhuma mensagem ainda.</p>}
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="text-xs text-gray-600">{msg.from === userId ? "Você" : msg.from}:</span>{" "}
            <span className="text-gray-800">{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
          placeholder="Digite sua mensagem"
        />
        <button
          type="submit"
          // disabled={status !== "connected" || !toUserId}
          className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      <div className="text-sm mt-2 text-gray-500">Status da conexão: {status}</div>
    </div>
  )
}
