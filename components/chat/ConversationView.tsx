import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageItem } from "./MessageItem";
import { ReplyBox } from "./ReplyBox";

import { MessageModel } from "./types";

type Props = {
  messages: MessageModel[];
  currentUserId: string;
  replyContent: string;
  onReplyChange: (value: string) => void;
  onReplySend: () => void;
  selectedUserConversation: string | null;
};

export const ConversationView = ({
  messages,
  currentUserId,
  replyContent,
  onReplyChange,
  onReplySend,
  selectedUserConversation,
}: Props) => (
  <Card className="therapy-card">
    <CardHeader className="p-2">
      <CardTitle className="text-lg text-therapy-tertiary">
        Conversa com {selectedUserConversation}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 p-2">
      <div className="flex flex-col space-y-2">
        {messages
          .slice()
          .reverse()
          .map((message, index) => (
            <MessageItem key={index} message={message} currentUserId={currentUserId} />
          ))}
      </div>
      <ReplyBox replyContent={replyContent} onChange={onReplyChange} onSend={onReplySend} />
    </CardContent>
  </Card>
);
