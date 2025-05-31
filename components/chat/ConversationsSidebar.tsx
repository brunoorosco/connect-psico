import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMessageTime } from "@/utils/formatMessageTime";

import { MessageModel } from "./types";

type Props = {
  messagesUsers: any[];
  selectedMessage: MessageModel[] | null;
  handleSelectConversation: (messages: MessageModel[], userConversation: string) => void;
};

export const ConversationsSidebar = ({
  messagesUsers,
  selectedMessage,
  handleSelectConversation,
}: Props) => (
  <Card className="therapy-card lg:p-2">
    <CardHeader className="p-2">
      <CardTitle className="text-lg text-therapy-tertiary">Conversas</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 p-2">
      {messagesUsers.length === 0 ? (
        <p className="text-gray-500 text-sm">Não há mensagens recentes</p>
      ) : (
        messagesUsers
          .sort(
            (a, b) =>
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
          )
          .map((message) => (
            <div
              key={message.conversationId}
              className={`p-2 rounded-md border cursor-pointer ${
                selectedMessage?.[0]?.id === message.conversationId
                  ? "bg-therapy-light/50"
                  : "bg-white"
              }`}
              onClick={() => handleSelectConversation(message.messages, message.name)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{message.name || ""}</div>
                <div className="text-xs text-gray-500">
                  {formatMessageTime(message.lastMessage.createdAt)}
                </div>
              </div>
              <p className="text-gray-700 line-clamp-2">{message.lastMessage.content}</p>
            </div>
          ))
      )}
    </CardContent>
  </Card>
);
