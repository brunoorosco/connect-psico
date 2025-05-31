"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createMessage } from "@/actions/messages";
import { useSession } from "next-auth/react";

import { ConversationsSidebar } from "./ConversationsSidebar";
import { ConversationView } from "./ConversationView";

import { MessageModel } from "./types";

type Props = {
  messages: MessageModel[];
};

const MessagesList = ({ messages }: Props) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel[] | null>(null);
  const [selectedUserConversation, setSelectedUserConversation] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { data: session } = useSession();

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

    const { senderId, receiverId } = {
      senderId: session.user.id,
      receiverId:
        lastMessage.senderId === session.user.id ? lastMessage.receiverId : lastMessage.senderId,
    };

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

  const messagesUsers = messages.map((conversation: any) => {
    const key = Object.keys(conversation)[0];
    const conversationId = conversation[key];
    const messageBySort = conversation.messages.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastMessageUserId = conversationId.split("-")[1];
    const nameUser =
      lastMessageUserId === messageBySort[0].senderId
        ? messageBySort[0].sender.name
        : messageBySort[0].receiver.name;

    return {
      conversationId,
      lastMessage: messageBySort[0],
      name: nameUser,
      messages: conversation.messages,
    };
  });

  const handleBackToList = () => setSelectedMessage(null);

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
    );
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
  );
};

export default MessagesList;
