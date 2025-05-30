"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageModel = {
  id: string;
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date;
};

type MessagesListProps = {
  messages: MessageModel[];
};

const formatMessageTime = (date: Date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = date.toLocaleDateString();

  return isToday ? time : `${formattedDate} - ${time}`;
};

const MessagesList = ({ messages }: MessagesListProps) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});

  const toggleReply = (messageId: string) => {
    setActiveReplyId((prev) => (prev === messageId ? null : messageId));
  };

  const handleReplyChange = (messageId: string, content: string) => {
    setReplyContents((prev) => ({ ...prev, [messageId]: content }));
  };

  const handleReplySend = (messageId: string) => {
    const reply = replyContents[messageId];
    console.log(`Enviando resposta para ${messageId}:`, reply);
    // Aqui pode chamar API ou outra função
    setReplyContents((prev) => ({ ...prev, [messageId]: "" }));
    setActiveReplyId(null);
  };

  return (
    <Card className="therapy-card">
      <CardHeader className="pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-center">
          <CardTitle className="text-lg font-medium text-therapy-tertiary">
            Mensagens Recentes
          </CardTitle>
          <div className="flex sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
            >
              Ver todas
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">Não há mensagens recentes</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {messages.map((message) => {
              const isReplying = activeReplyId === message.id;
              const replyContent = replyContents[message.id] || "";

              return (
                <div
                  key={message.id}
                  className={`p-2 rounded-md border grid gap-1 text-sm ${
                    !message.read ? "bg-therapy-light/30 border-therapy-light" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{message.sender.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatMessageTime(new Date(message.createdAt))}
                    </div>
                  </div>

                  <p className="text-gray-700 line-clamp-2">{message.content}</p>

                  <div className="flex justify-end items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
                      onClick={() => toggleReply(message.id)}
                    >
                      {isReplying ? "Fechar" : "Responder"}
                    </Button>
                    {!message.read && (
                      <div className="px-2 py-0.5 text-xs bg-therapy-primary text-white rounded-full">
                        Novo
                      </div>
                    )}
                  </div>

                  {isReplying && (
                    <div className="mt-2 p-2 rounded-lg bg-therapy-light/20 border border-therapy-light">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => handleReplyChange(message.id, e.target.value)}
                        placeholder={`Responder para ${message.sender.name}`}
                        className="w-full text-sm"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReplySend(message.id)}
                          disabled={!replyContent}
                          className="text-xs"
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesList;
