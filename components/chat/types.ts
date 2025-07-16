import { MessageModel } from "@/domain/model/messageChat"

export interface IConversationsSidebar {
  messagesUsers: any[]
  selectedMessage: MessageModel[] | null
  handleSelectConversation: (messages: MessageModel[], userConversation: string,message:any) => void
}

export interface IConversationView {
  messages: MessageModel[]
  currentUserId: string
  replyContent: string
  onReplyChange: (value: string) => void
  onReplySend: () => void
  selectedUserConversation: string | null
}
