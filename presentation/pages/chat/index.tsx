"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useMessages } from "@/hooks/useMessages"
import { MessageModel } from "@/domain/model/messageChat"
import { ConversationView } from "@components/chat/ConversationView"
import { ConversationsSidebar } from "@components/chat/ConversationsSidebar"

type Props = {
  messages: MessageModel[]
}

const MessagesList = ({ messages }: Props) => {
  const {
    isMobile,
    session,
    selectedMessage,
    selectedUserConversation,
    replyContent,
    messagesUsers,
    handleSelectConversation,
    handleReplySend,
    handleBackToList,
    setReplyContent,
  } = useMessages(messages)

  if (isMobile && selectedMessage) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleBackToList}>
          Voltar
        </Button>
        <ConversationView
          messages={selectedMessage}
          currentUserId={session?.user.id || ""}
          replyContent={replyContent}
          onReplyChange={setReplyContent}
          onReplySend={handleReplySend}
          selectedUserConversation={selectedUserConversation}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:h-[calc(100vh-30px)]">
      <ConversationsSidebar
        messagesUsers={messagesUsers}
        selectedMessage={selectedMessage}
        handleSelectConversation={handleSelectConversation}
      />

      <div>
        {selectedMessage ? (
          <ConversationView
            messages={selectedMessage}
            currentUserId={session?.user.id || ""}
            replyContent={replyContent}
            onReplyChange={setReplyContent}
            onReplySend={handleReplySend}
            selectedUserConversation={selectedUserConversation}
          />
        ) : (
          <p className="text-gray-500">Selecione uma conversa para visualizar</p>
        )}
      </div>
    </div>
  )
}

export default MessagesList
