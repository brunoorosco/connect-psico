
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessagesListProps {
  messages: Message[];
}

const MessagesList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <Card className="therapy-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-therapy-tertiary">
            Mensagens Recentes
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
          >
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Não há mensagens recentes</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-3 rounded-lg border ${
                  !message.read 
                    ? "bg-therapy-light/30 border-therapy-light" 
                    : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{message.sender}</div>
                  <div className="text-xs text-gray-500">{message.timestamp}</div>
                </div>
                <p className="text-sm text-gray-700 truncate">{message.content}</p>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
                  >
                    Responder
                  </Button>
                  {!message.read && (
                    <div className="ml-2 px-2 py-2 text-xs bg-therapy-primary text-white rounded-full">
                      Novo
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
