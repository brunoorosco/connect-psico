"use client";
import React, { useState, useEffect, startTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createMessage } from "@/actions/messages";

type MessageModel = {
  id?: string;
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date | string;
  receiverId: string;
};

type MessagesListProps = {
  messages: MessageModel[];
};

const formatMessageTime = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = date.toLocaleDateString();
  return isToday ? time : `${formattedDate} - ${time}`;
};

const MessagesList = ({ messages }: MessagesListProps) => {
  const [selectedMessage, setSelectedMessage] = useState<MessageModel | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  console.log("MessagesList rendered", messages);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (message: MessageModel) => {
    console.log("Message selected:", message);
    setSelectedMessage(message);
    setReplyContent("");
  };

  const handleReplySend = () => {
    if (!selectedMessage || !replyContent.trim()) return;

    const { senderId, receiverId } = {
      senderId: selectedMessage.receiverId,
      receiverId: selectedMessage.senderId,
    };

    startTransition(async () => {
      const result = await createMessage({
        senderId,
        receiverId,
        content: replyContent.trim(),
      });

      if (result.error) {
        toast.error("Erro ao enviar mensagem", { description: result.error });
      } else {
        toast.success("Mensagem enviada!", { description: "Sua mensagem foi enviada com sucesso!" });
        setReplyContent("");
      }
    });
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const lastMessages = messages.map((conversation:any) => {
  const key = Object.keys(conversation)[0];
  const messages = conversation[key];
  const lastMessage = messages[messages.length - 1];
  
  return { conversationId: key, lastMessage };
});

console.log("lastMessages:", lastMessages);

  const renderConversation = (message: MessageModel) => (
    <Card className="therapy-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Conversa com {message.sender.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-2 rounded-md border bg-white">
          <div className="text-sm text-gray-700">{message.content}</div>
          <div className="text-xs text-gray-500">{formatMessageTime(message.createdAt)}</div>
        </div>

        <Textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder={`Responder para ${message.sender.name}`}
          className="w-full text-sm"
          rows={3}
        />
        <div className="flex justify-end">
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
      </CardContent>
    </Card>
  );

  if (isMobile && selectedMessage) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleBackToList}>
          Voltar
        </Button>
        {renderConversation(selectedMessage)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:h-[calc(100vh-30px)]">
      {/* Lista de conversas */}
      <Card className="therapy-card lg:p-2">
        <CardHeader className="p-2">
          <CardTitle className="text-lg text-therapy-tertiary">Conversas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">Não há mensagens recentes</p>
          ) : (
            messages
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-md border cursor-pointer ${
                    selectedMessage?.id === message.id
                      ? "bg-therapy-light/50"
                      : "bg-white"
                  }`}
                  onClick={() => handleSelectConversation(message)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{message.sender.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{message.content}</p>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Conversa completa */}
      <div>
        {selectedMessage ? (
          renderConversation(selectedMessage)
        ) : (
          <p className="text-gray-500">Selecione uma conversa para visualizar</p>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
