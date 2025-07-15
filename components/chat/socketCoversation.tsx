"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useWebSocket } from "@hooks/useWebSocket"
import { getAccessTokenAction } from "@/actions/messages"
import { ConversationView } from "./ConversationView"

export default function SocketConversation() {
  const { data: session, status: sessionStatus } = useSession()
  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")
  const [toUserId, setToUserId] = useState("") // define com input, rota ou props
  const [replyContent, setReplyContent] = useState("")

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

  const handleSend = () => {
    const message = replyContent.trim()
    if (!message || !toUserId || status !== "connected") return

    send(toUserId, message)
    setReplyContent("")
  }

  if (sessionStatus === "loading" || !token) {
    return <p>Carregando sessão e autenticando...</p>
  }

  const formattedMessages = messages.map((msg) => ({
    senderId: msg.from,
    sender: { name: msg.from === userId ? "Você" : msg.from },
    content: msg.text,
    read: true,
    createdAt: new Date(),
    receiverId: msg.to,
  }))

  return (
    <div className="max-w-3xl mx-auto p-4">
      <label className="text-sm block mb-2">ID do destinatário:</label>
      <input
        type="text"
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-4"
        placeholder="Digite o userId para conversar"
      />
      <ConversationView
        messages={formattedMessages}
        currentUserId={userId}
        replyContent={replyContent}
        onReplyChange={setReplyContent}
        onReplySend={handleSend}
        selectedUserConversation={toUserId || "Desconhecido"}
      />
    </div>
  )
}
