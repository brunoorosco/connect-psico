// hooks/useMessages.ts
import { useEffect, useState, startTransition } from "react";
import { createMessage } from "@/actions/messages";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { MessageModel } from "@/domain/model/messageChat";

export const useMessages = (messages: MessageModel[]) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel[] | null>(null);
  const [selectedUserConversation, setSelectedUserConversation] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { data: session } = useSession();
  const currentUserId = session?.user.id;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (messages: MessageModel[], userConversation: string) => {
    setSelectedMessage(messages);
    setSelectedUserConversation(userConversation);
    setReplyContent("");
  };

  const handleReplySend = () => {
    if (!selectedMessage || !replyContent.trim() || !session?.user.id) return;

    const lastMessage = selectedMessage[selectedMessage.length - 1];
    const senderId = session.user.id;
    const receiverId =
      lastMessage.senderId === senderId ? lastMessage.receiverId : lastMessage.senderId;

    startTransition(async () => {
      const result = await createMessage({ senderId, receiverId, content: replyContent.trim() });

      if (result.error) {
        toast.error("Erro ao enviar mensagem", { description: result.error });
      } else {
        toast.success("Mensagem enviada!", {
          description: "Sua mensagem foi enviada com sucesso!",
        });
        setReplyContent("");
      }
    });
  };

  const handleBackToList = () => setSelectedMessage(null);

const messagesUsers = messages.map((conversation: any) => {
  const key = Object.keys(conversation)[0];
  const conversationId = conversation[key];
  const sortedMessages = conversation.messages.sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastMessage = sortedMessages[0];

  const otherUser =
    lastMessage.senderId === currentUserId ? lastMessage.receiver : lastMessage.sender;

  return {
    conversationId,
    lastMessage,
    name: otherUser.name,
    messages: conversation.messages,
  };
});

  return {
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
  };
};
