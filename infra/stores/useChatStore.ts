import { create } from "zustand"
import { toast } from "sonner"
import { useAuthStore } from "./useAuthStore"
import { sendMessageApi, getMessageApi, getContactsApi, getUserChat } from "@/actions/messages"
import { UserChat } from "@/domain/model/patient"
import { User } from "next-auth"
import { getUserChatProfessionals } from "@/actions/messages/getUserChatProfessional"
import { TMessage } from "@components/chat/ChatContainer"
import { ingestDigest } from "@/actions/digest"

// ─── Cache config ──────────────────────────────────────────────────────────────
const TTL_MS = 60_000 // 1 min
const MAX_CACHE_ENTRIES = 50
type MessageCacheEntry = { items: TMessage[]; fetchedAt: number }

type TMessageSend = Omit<TMessage, "_id" | "createdAt">
type State = {
  selectedUser: UserChat | null
  messages: TMessage[]
  users: UserChat[]

  // loading flags
  isUsersLoading: boolean
  isMessagesLoading: boolean

  // cache
  messageCache: Map<string, MessageCacheEntry>
  invalidateMessageCache: (userId?: string) => void

  // actions
  setSelectedUser: (user: UserChat | null) => void
  getUsers: (user: User) => Promise<void>
  getMessages: (userId: string, opts?: { forceRefresh?: boolean }) => Promise<void>
  sendMessage: (message: TMessageSend) => Promise<void>
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
}

export const useChatStore = create<State>((set, get) => ({
  // state
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // cache Map
  messageCache: new Map<string, MessageCacheEntry>(),

  // ── Helpers de cache ────────────────────────────────────────────────────────
  invalidateMessageCache: (userId) => {
    const { messageCache } = get()
    if (userId) {
      messageCache.delete(userId)
    } else {
      messageCache.clear()
    }
    set({ messageCache: new Map(messageCache) })
  },

  // ── Users ───────────────────────────────────────────────────────────────────
  getUsers: async (user: User): Promise<void> => {
    set({ isUsersLoading: true })
    try {
      const [usersChat, usershat] = await Promise.all([
        user.role === "SUPERVISOR" ? getUserChat() : Promise.resolve([]),
        getContactsApi(),
      ])

      let chatIds: Set<string> = new Set()
      if (Array.isArray(usersChat)) {
        chatIds = new Set(usersChat.map((u: { userId: string }) => u.userId))
      }

      const usershatSafe: string[] = Array.isArray(usershat) ? usershat : []
      const contactIds = new Set<string>(usershatSafe)
      const unionIds = Array.from(new Set([...contactIds, ...Array.from(chatIds)]))

      if (unionIds.length === 0) {
        set({ users: [] })
        return
      }

      const usersRes = await getUserChatProfessionals(unionIds)
      if (!usersRes) {
        toast.error("Erro ao buscar usuários")
        return
      }
      // @ts-ignore
      set({ users: usersRes })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao buscar usuários")
    } finally {
      set({ isUsersLoading: false })
    }
  },

  // ── Selecionar usuário ──────────────────────────────────────────────────────
  setSelectedUser: (user) => {
    const { messageCache } = get()
    
    if (!user) {
      set({ selectedUser: null, messages: [] })
      return
    }

    const entry = messageCache.get(user.userId)
    set({
      selectedUser: user,
      messages: entry ? entry.items : [],
    })
  },

  // ── Buscar mensagens com cache ──────────────────────────────────────────────
  getMessages: async (userId: string, opts?: { forceRefresh?: boolean }) => {
    const { messageCache } = get()
    const force = opts?.forceRefresh === true

    // 1) Tentar cache fresco
    const entry = messageCache.get(userId)
    const fresh = entry && Date.now() - entry.fetchedAt < TTL_MS

    if (entry && fresh && !force) {
      set({ messages: entry.items })
      return
    }

    // 2) Buscar da API
    set({ isMessagesLoading: true })
    try {
      const res = await getMessageApi(userId)
      const items: TMessage[] = Array.isArray(res) ? res : []

      set({ messages: items })

      // LRU: remove o mais antigo se passar do limite
      if (!messageCache.has(userId) && messageCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = messageCache.keys().next().value
        messageCache.delete(oldestKey ?? "")
      }
      
      messageCache.delete(userId)
      messageCache.set(userId, { items, fetchedAt: Date.now() })
      set({ messageCache: new Map(messageCache) })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao buscar mensagens")
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  // ── Enviar mensagem (CORRIGIDO) ─────────────────────────────────────────────
  sendMessage: async (messageData: TMessageSend) => {
    const { selectedUser, messages, messageCache } = get()

    // CRÍTICO: receiverId deve vir de messageData, não do selectedUser
    const targetUserId = messageData.receiverId
    
    if (!targetUserId) {
      console.error("receiverId não especificado em messageData")
      toast.error("Erro: destinatário não especificado")
      return
    }

    try {
      // Enviar para a API
      const resp = await sendMessageApi(targetUserId, messageData)
      
      // Ingerir digest apenas para o destinatário correto
      await ingestDigest(targetUserId)

      // IMPORTANTE: Só atualiza o estado se a mensagem for para o usuário selecionado
      const isForSelectedUser = selectedUser?.userId === targetUserId

      if (isForSelectedUser) {
        // Atualizar estado de mensagens (deduplica por _id)
        const messageExists = messages.some((m) => m._id === resp._id)
        const updatedMessages = messageExists ? messages : [...messages, resp]
        set({ messages: updatedMessages })
      }

      // SEMPRE atualiza o cache para o destinatário correto
      const cached = messageCache.get(targetUserId)
      const cachedItems = cached?.items ?? []
      const hasCached = cachedItems.some((m) => m._id === resp._id)
      const updatedCacheItems = hasCached ? cachedItems : [...cachedItems, resp]

      // Atualizar cache (LRU touch)
      messageCache.delete(targetUserId)
      messageCache.set(targetUserId, { 
        items: updatedCacheItems, 
        fetchedAt: Date.now() 
      })
      set({ messageCache: new Map(messageCache) })

      // Log para debug
      console.log(`Mensagem enviada para ${targetUserId}, selectedUser: ${selectedUser?.userId}`)

    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)
      toast.error(error?.response?.data?.message || "Erro ao enviar mensagem")
    }
  },

  // ── Socket ──────────────────────────────────────────────────────────────────
  subscribeToMessages: () => {
    const { selectedUser } = get()
    const socket = useAuthStore.getState().socket
    if (!selectedUser || !socket) return

    socket.on("newMessage", (newMessage: TMessage) => {
      // Só processa mensagens do usuário selecionado
      const isFromSelected = newMessage.senderId === selectedUser.userId
      if (!isFromSelected) return

      const { messages, messageCache } = get()
      
      // Atualizar estado (deduplica)
      const messageExists = messages.some((m) => m._id === newMessage._id)
      const updatedMessages = messageExists ? messages : [...messages, newMessage]
      set({ messages: updatedMessages })

      // Atualizar cache
      const cached = messageCache.get(selectedUser.userId)
      const cachedItems = cached?.items ?? []
      const hasCached = cachedItems.some((m) => m._id === newMessage._id)
      const updatedCacheItems = hasCached ? cachedItems : [...cachedItems, newMessage]

      messageCache.delete(selectedUser.userId)
      messageCache.set(selectedUser.userId, { 
        items: updatedCacheItems, 
        fetchedAt: Date.now() 
      })
      set({ messageCache: new Map(messageCache) })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return
    socket.off("newMessage")
  },
}))