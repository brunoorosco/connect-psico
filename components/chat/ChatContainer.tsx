"use client"

import { useEffect, useRef } from "react"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import { formatMessageTime } from "@/utils/formatMessageTime"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"

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
        <div>Loading</div>
        <MessageInput />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: TMessage) => {
          const isCurrentUser = message.senderId === user?.id

          return (
            <div key={message._id} className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                {/* horário acima do balão */}
                <time className="text-[11px] leading-none text-zinc-500 mb-2 -mt-1">
                  {formatMessageTime(message.createdAt)}
                </time>

                {/* balão */}
                <div
                  className={[
                    "px-3 py-2 rounded-2xl shadow-sm break-words whitespace-pre-wrap",
                    "text-sm sm:text-base",
                    // cores e canto “aberto” por lado:
                    isCurrentUser
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-base-200 text-base-content rounded-tl-none",
                  ].join(" ")}
                >
                  {/* mídia opcional */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Anexo"
                      className="rounded-md mb-2 max-w-full sm:max-w-[240px] h-auto"
                    />
                  )}

                  {/* texto */}
                  {!!message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer
