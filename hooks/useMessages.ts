// hooks/useMessages.ts
"use client"
import { useEffect, useState, startTransition } from "react"
import { createMessage, getAccessTokenAction } from "@/actions/messages"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { MessageModel } from "@/domain/model/messageChat"
import { useWebSocket } from "./useWebSocket"

export const useMessages = (messages: MessageModel[]) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel[] | null>(null)
  const [selectedUserConversation, setSelectedUserConversation] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>("")
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [token, setToken] = useState("")
  const [input, setInput] = useState("")
  const [toUserId, setToUserId] = useState("")
  const [userId, setUserId] = useState("")

  const { data: session, status: statusSession } = useSession()
  const currentUserId = session?.user.id
  const socketReady = !!(currentUserId && token)
  const { messages: msg, status, send } = useWebSocket(socketReady ? currentUserId : "__", socketReady ? token : "__")
  console.log("msg::", msg)

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

  const handleSelectConversation = (messages: MessageModel[], userConversation: string) => {
    setSelectedMessage(messages)
    setSelectedUserConversation(userConversation)
    setReplyContent("")
  }

  const handleReplySend = () => {
    if (!selectedMessage || !replyContent.trim() || !session?.user.id) return

    const lastMessage = selectedMessage[selectedMessage.length - 1]
    const senderId = session.user.id
    const receiverId = lastMessage.senderId === senderId ? lastMessage.receiverId : lastMessage.senderId
    console.log(senderId, toUserId, replyContent.trim())
    if (!replyContent.trim() || !receiverId || !userId) return

    if (status === "connected") {
      send(receiverId, replyContent.trim())
    }
    startTransition(async () => {
      const result = await createMessage({ senderId, receiverId, content: replyContent.trim() })
      setReplyContent("")
    })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    const message = input.trim()
    if (!message || !toUserId || !userId) return

    if (status === "connected") {
      send(toUserId, message)
    }
    setInput("")
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
