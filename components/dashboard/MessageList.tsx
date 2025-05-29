import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MessageModel = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  userId: string | null; // ✅ permitir null explicitamente
};

type MessagesListProps = {
  messages: MessageModel[];
};

const MessagesList = ({ messages }: MessagesListProps) => {
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
          <div className="text-center py-8">
            <p className="text-gray-500">Não há mensagens recentes</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {messages &&
              messages?.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border grid gap-2 ${
                    !message.read ? "bg-therapy-light/30 border-therapy-light" : "bg-white"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
                    <div className="font-medium">{message.senderId}</div>
                    <div className="text-xs text-gray-500 sm:text-right">
                      {message.createdAt.toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 truncate">{message.content}</p>

                  <div className="grid grid-cols-1 sm:flex justify-end items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
                    >
                      Responder
                    </Button>
                    {!message.read && (
                      <div className="px-2 py-1 text-xs bg-therapy-primary text-white rounded-full text-center">
                        Novo
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesList;
