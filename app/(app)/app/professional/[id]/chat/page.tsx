import MessagesList from "@/components/dashboard/MessageList";
import { getMessages } from "@/actions/messages";
import { auth } from "@/auth";

const Messages = async () => {
  const session = await auth();
  const result = await getMessages(session?.user.id as string);

  if ("error" in result) {
    return <div>Erro: {result.error}</div>;
  }

  return <MessagesList messages={result} />;
};

export default Messages;
