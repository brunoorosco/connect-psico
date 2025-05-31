import { formatMessageTime } from "@/utils/formatMessageTime";

type MessageModel = {
  id?: string;
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date | string;
  receiverId: string;
};

type Props = {
  message: MessageModel;
  currentUserId: string;
};

export const MessageItem = ({ message, currentUserId }: Props) => {
  const isCurrentUser = message.senderId === currentUserId;

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs p-2 rounded-lg ${
          isCurrentUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">{formatMessageTime(message.createdAt)}</div>
      </div>
    </div>
  );
};
