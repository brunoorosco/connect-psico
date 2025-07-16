import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageItem } from "./MessageItem"
import { ReplyBox } from "./ReplyBox"
import { IConversationView } from "./types"

export const ConversationView = ({
  messages,
  currentUserId,
  replyContent,
  onReplyChange,
  onReplySend,
  selectedUserConversation,
}: IConversationView) => {
  return (
    <Card className="therapy-card lg:h-[calc(100vh-30px)] h-[calc(100vh-120px)] overfl flex flex-col">
      <CardHeader className="p-2">
        <CardTitle className="text-lg text-therapy-tertiary">Conversa com {selectedUserConversation}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-2 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col space-y-2">
            {messages
              .slice()
              .reverse()
              .map((message, index) => (
                <MessageItem key={index} message={message} currentUserId={currentUserId} />
              ))}
          </div>
        </div>
        <ReplyBox replyContent={replyContent} onChange={onReplyChange} onSend={onReplySend} />
      </CardContent>
    </Card>
  )
}
