import { getMessages } from "@/actions/messages/getMessages";
import MessagesList from "@presentation/pages/chat";

const Messages = async () => {
  const result = await getMessages();

  if ("error" in result) {
    return <div>Erro: {result.error}</div>;
  }

  return <MessagesList messages={result} />;
};

export default Messages;
