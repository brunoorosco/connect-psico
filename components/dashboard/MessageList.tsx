"use client"
import React, { useState, useEffect, startTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createMessage } from "@/actions/messages"
import { useSession } from "next-auth/react"
import { createMessageService } from "@services/messageService"

type MessageModel = {
  id?: string
  senderId: string
  sender: { name: string }
  content: string
  read: boolean
  createdAt: Date | string
  receiverId: string
}

type MessagesListProps = {
  messages: MessageModel[]
}

const formatMessageTime = (dateInput: Date | string) => {
  const date = new Date(dateInput)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const formattedDate = date.toLocaleDateString()
  return isToday ? time : `${formattedDate} - ${time}`
}

type MessageItemProps = {
  message: MessageModel
  currentUserId: string
}

const MessageItem = ({ message, currentUserId }: MessageItemProps) => {
  const isCurrentUser = message.senderId === currentUserId

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs p-2 rounded-lg ${
          isCurrentUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">{formatMessageTime(message.createdAt)}</div>
      </div>
    </div>
  )
}

const MessagesList = ({ messages }: MessagesListProps) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel[] | null>(null)
  const [selectedUserConversation, setSelectedUserConversation] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<string>("")
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
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

    const { senderId, receiverId } = {
      senderId: session.user.id,
      receiverId: lastMessage.senderId === session.user.id ? lastMessage.receiverId : lastMessage.senderId,
    }

    startTransition(async () => {
      const result = await createMessageService({
        senderId,
        receiverId,
        content: replyContent.trim(),
      })
      // const result = await createMessage({
      //   senderId,
      //   receiverId,
      //   content: replyContent.trim(),
      // })

      if (result.error) {
        toast.error("Erro ao enviar mensagem", { description: result.error })
      } else {
        toast.success("Mensagem enviada!", {
          description: "Sua mensagem foi enviada com sucesso!",
        })
        setReplyContent("")
      }
    })
  }

  const handleBackToList = () => {
    setSelectedMessage(null)
  }

  const messagesUsers = messages.map((conversation: any) => {
    const key = Object.keys(conversation)[0]
    const conversationId = conversation[key]
    const messageBySort = conversation.messages.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const lastMessageUserId = conversationId.split("-")[1]
    const nameUser =
      lastMessageUserId === messageBySort[0].senderId ? messageBySort[0].sender.name : messageBySort[0].receiver.name

    return {
      conversationId,
      lastMessage: messageBySort[0],
      name: nameUser,
      messages: conversation.messages,
    }
  })

  function renderMessages(messages: MessageModel[], currentUserId: string) {
    return messages.map((message, index) => <MessageItem key={index} message={message} currentUserId={currentUserId} />)
  }

  function renderConversation(messages: MessageModel[], currentUserId?: string) {
    return (
      <Card className="therapy-card">
        <CardHeader className="p-2">
          <CardTitle className="text-lg text-therapy-tertiary">Conversa com {selectedUserConversation}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          <div className="flex flex-col space-y-2">
            {currentUserId && renderMessages(messages.reverse(), currentUserId)}
          </div>
          <div className="mt-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full text-sm"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleReplySend}
                disabled={!replyContent.trim()}
                className="text-xs"
              >
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isMobile && selectedMessage) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleBackToList}>
          Voltar
        </Button>
        {renderConversation(selectedMessage, session?.user.id)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:h-[calc(100vh-30px)]">
      {/* Lista de conversas */}
      <Card className="therapy-card lg:p-2">
        <CardHeader className="p-2">
          <CardTitle className="text-lg text-therapy-tertiary">Conversas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          {messagesUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">Não há mensagens recentes</p>
          ) : (
            messagesUsers
              .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
              .map((message) => (
                <div
                  key={message.conversationId}
                  className={`p-2 rounded-md border cursor-pointer ${
                    selectedMessage?.[0]?.id === message.conversationId ? "bg-therapy-light/50" : "bg-white"
                  }`}
                  onClick={() => handleSelectConversation(message.messages, message.name)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{message.name || ""}</div>
                    <div className="text-xs text-gray-500">{formatMessageTime(message.lastMessage.createdAt)}</div>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{message.lastMessage.content}</p>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Conversa completa */}
      <div>
        {selectedMessage ? (
          renderConversation(selectedMessage, session?.user.id)
        ) : (
          <p className="text-gray-500">Selecione uma conversa para visualizar</p>
        )}
      </div>
    </div>
  )
}

export default MessagesList
