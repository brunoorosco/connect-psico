import MessagesList from "@/components/dashboard/MessageList";
import { getMessages } from "@/actions/messages";

const Messages = async () => {
  const result = await getMessages();

  if ("error" in result) {
    return <div>Erro: {result.error}</div>;
  }

  return <MessagesList messages={result} />;
};

export default Messages;
