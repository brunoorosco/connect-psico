import { create } from "zustand"
import { toast } from "sonner"
import { useAuthStore } from "./useAuthStore"
import { sendMessageApi, getMessageApi, getUserChat, getContactsApi } from "@/actions/messages"
import { UserChat } from "@/domain/model/patient"
import { User } from "next-auth"
import { getUserChatProfessionals } from "@/actions/messages/getUserChatProfessional"
import { TMessage } from "@/app/(app)/chat/ChatContainer"

type TMessageSend = Omit<TMessage, "_id" | "createdAt">
type State = {
  selectedUser: UserChat
  messages: TMessage[]
  setSelectedUser: (user: UserChat) => void
  sendMessage: (message: TMessageSend) => Promise<void>
  subscribeToMessages: () => void
  isUsersLoading: Boolean
  isMessagesLoading: Boolean
  getMessages: (userId: string) => Promise<void>
  unsubscribeFromMessages: () => void
  getUsers: (user: User) => Promise<void>
  users: UserChat[]
}

export const useChatStore = create<State>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: {} as UserChat,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async (user: User): Promise<void> => {
    set({ isUsersLoading: true })
    let users
    try {
      if (user.role === "SUPERVISOR") {
        users = await getUserChat()
        if (!users) {
          toast.error("Erro ao buscar usuários")
          return
        }
      } else {
        const usersChat = await getContactsApi()
        users = await getUserChatProfessionals(usersChat as string[])

        if (!users) {
          toast.error("Erro ao buscar usuários")
          return
        }
      }
      // @ts-ignore
      set({ users })
    } catch (error: Error | any) {
      toast.error(error.response?.data?.message || "Erro ao buscar usuários")
    } finally {
      set({ isUsersLoading: false })
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true })
    try {
      const res = await getMessageApi(userId) // ou use axiosInstance.get(`/messages/${userId}`);
      set({ messages: res })
    } catch (error: Error | any) {
      toast.error(error.response?.data?.message || "Erro ao buscar mensagens")
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (messageData: TMessageSend) => {
    const { selectedUser, messages } = get()

    if (!selectedUser) return
    try {
      const resp = await sendMessageApi(selectedUser.userId, messageData)
      set({ messages: [...messages, resp] })
    } catch (error: Error | any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Erro ao enviar mensagem")
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get()
    const socket = useAuthStore.getState().socket
    

    if (!selectedUser || !socket) return

    socket.on("newMessage", (newMessage: TMessage) => {
      console.log("new message",newMessage)
      const isFromUser = newMessage.senderId === selectedUser.userId
      if (!isFromUser) return

      set({ messages: [...get().messages, newMessage] })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return
    socket.off("newMessage")
  },
  setSelectedUser: (user: UserChat) => {
    set({ selectedUser: user, messages: [] }) // limpa mensagens ao trocar de usuário
  },
}))
