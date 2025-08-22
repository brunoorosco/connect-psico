"use client"

import { useEffect, useRef } from "react"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import { formatMessageTime } from "@/utils/formatMessageTime"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"
import { getInitials } from "@/utils/getInitialsName"

export type TMessage = {
  _id: string
  senderId: string
  receiverId: string
  text: string
  image: any
  createdAt: string
}

const ChatContainer = () => {
  const user = useCurrentUser()
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore()

  const messageEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedUser?.userId) {
      getMessages(selectedUser.userId)
      subscribeToMessages()

      return () => {
        unsubscribeFromMessages()
      }
    }
  }, [getMessages, selectedUser?.userId, subscribeToMessages, unsubscribeFromMessages])

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        {/* <MessageSkeleton /> */}
        <MessageInput />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: TMessage) => {
          const isCurrentUser = message.senderId === user?.id
          const avatarSrc = isCurrentUser ? (user?.image as string) : selectedUser?.image || ""
          const nameSrc = isCurrentUser ? (user?.name as string) : selectedUser?.name || ""

          return (
            <div
              key={message._id}
              className={`${isCurrentUser ? "justify-end" : "justify-start"} flex gap-3`}
              ref={messageEndRef}
            >
              <Avatar>
                <AvatarImage src={avatarSrc} alt="User Avatar" />
                <AvatarFallback>{getInitials(nameSrc)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>

                <div className="flex flex-col">
                  {message.image && (
                    <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md" />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer
