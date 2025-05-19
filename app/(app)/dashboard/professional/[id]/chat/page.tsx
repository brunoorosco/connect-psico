import React from "react";
import ProfileProfessionalForm from "@/components/profile";
import MessagesList from "@/components/dashboard/MessageList";

const mockMessages = [
    {
      id: 1,
      sender: "Maria Silva",
      content:
        "Olá, preciso remarcar minha consulta de amanhã para a próxima semana, seria possível?",
      timestamp: "10:30",
      read: false,
    },
    {
      id: 2,
      sender: "João Oliveira",
      content: "Confirmo minha presença na consulta de hoje às 10:30.",
      timestamp: "08:45",
      read: true,
    },
    {
      id: 3,
      sender: "Ana Santos",
      content:
        "Gostaria de enviar o resultado dos exames que o senhor solicitou na última consulta.",
      timestamp: "Ontem",
      read: true,
    },
  ];
  
const Messages: React.FC = () => {
  return (
    <MessagesList messages={mockMessages} />
  );
};

export default Messages;