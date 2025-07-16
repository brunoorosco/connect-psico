// hooks/useMessages.ts
"use client"
import { useEffect, useState, startTransition } from "react"
import { createMessage, getAccessTokenAction } from "@/actions/messages"
import { useSession } from "next-auth/react"
import { MessageModel } from "@/domain/model/messageChat"
import { useWebSocket } from "./useWebSocket"

export const useMessages = (messages: MessageModel[]) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel[] | null>(null)
  const [selectedUserConversation, setSelectedUserConversation] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>("")
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [token, setToken] = useState("")
  const [userId, setUserId] = useState("")

  const { data: session, status: statusSession } = useSession()
  const currentUserId = session?.user.id
  const socketReady = !!(currentUserId && token)
  const { messages: msg, status, send } = useWebSocket(socketReady ? currentUserId : "__", socketReady ? token : "__")

  const fetchToken = async () => {
    const result = await getAccessTokenAction()
    if (result.ok) {
      setUserId(result.userId as string)
      setToken(result.accessToken as string)
    }
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    fetchToken()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!msg || !Array.isArray(msg)) return
    if (!selectedUserConversation || !session?.user.id) return

    msg.forEach((newMsg: any) => {
      const senderId = newMsg.from
      const receiverId = newMsg.to

      const isCurrentConversation =
        (senderId === selectedUserConversation && receiverId === session.user.id) ||
        (receiverId === selectedUserConversation && senderId === session.user.id)

      console.log("Nova mensagem recebida:", newMsg)
      console.log("Usuário logado:", session.user.id)
      console.log("Conversa selecionada:", selectedUserConversation)
      console.log("isCurrentConversation?", isCurrentConversation)

      if (isCurrentConversation) {
        const formattedMessage: MessageModel = {
          senderId,
          receiverId,
          content: newMsg.text,
          createdAt: new Date(),
          read: false,
          sender: { name: "" }, // preencha se tiver
        }

        setSelectedMessage((prev) => [...(prev || []), formattedMessage])

        // Salvar no banco
        startTransition(async () => {
          await createMessage({
            senderId,
            receiverId,
            content: newMsg.text,
          })
        })
      }
    })
  }, [msg, selectedUserConversation, session?.user.id])

  const handleSelectConversation = (messages: MessageModel[], _userConversation: string, message: MessageModel) => {
    setSelectedMessage(messages)

    const otherUserId = message.senderId === session?.user.id ? message.receiverId : message.senderId

    setSelectedUserConversation(otherUserId) // ✅ Agora é o ID correto do outro usuário
    setReplyContent("")
  }

  const handleReplySend = () => {
    if (!selectedMessage || !replyContent.trim() || !session?.user.id) return

    const lastMessage = selectedMessage[selectedMessage.length - 1]
    const senderId = session.user.id
    const receiverId = lastMessage.senderId === senderId ? lastMessage.receiverId : lastMessage.senderId
    const content = replyContent.trim()

    if (!content || !receiverId || !userId) return

    const newMessage: MessageModel = {
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
      read: false,
      sender: { name: session.user.name ?? "Você" },
    }

    // Adiciona a mensagem localmente para exibição imediata
    setSelectedMessage((prev) => [...(prev || []), newMessage])

    if (status === "connected") {
      send(receiverId, replyContent.trim())
    }
    startTransition(async () => {
      await createMessage({ senderId, receiverId, content })
      setReplyContent("")
    })
  }

  const handleBackToList = () => setSelectedMessage(null)

  const messagesUsers = messages.map((conversation: any) => {
    const key = Object.keys(conversation)[0]
    const conversationId = conversation[key]
    const sortedMessages = conversation.messages.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const lastMessage = sortedMessages[0]

    const otherUser = lastMessage.senderId === currentUserId ? lastMessage.receiver : lastMessage.sender

    return {
      conversationId,
      lastMessage,
      name: otherUser.name,
      messages: conversation.messages,
    }
  })

  return {
    isMobile,
    session,
    statusSession,
    selectedMessage,
    selectedUserConversation,
    replyContent,
    messagesUsers,
    handleSelectConversation,
    handleReplySend,
    handleBackToList,
    setReplyContent,
    token,
  }
}
