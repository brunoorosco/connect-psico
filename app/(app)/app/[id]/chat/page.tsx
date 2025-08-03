import { getMessages } from "@/actions/messages/getMessages";
import ChatPage from "@presentation/pages/chat/index";

const Messages = async () => {
  const result = await getMessages();

  if ("error" in result) {
    return <div>Erro: {result.error}</div>;
  }

  return <ChatPage  />;
};

export default Messages;
