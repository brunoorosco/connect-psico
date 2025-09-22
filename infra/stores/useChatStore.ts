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
const TTL_MS = 60_000;                // 1 min; ajuste como quiser
const MAX_CACHE_ENTRIES = 50;         // simples LRU (limita crescimento)
type MessageCacheEntry = { items: TMessage[]; fetchedAt: number };

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

  // cache Map para permitir LRU por ordem de inserção
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

  // ── Users (sem alterações relevantes) ───────────────────────────────────────
  getUsers: async (user: User): Promise<void> => {
    set({ isUsersLoading: true })
    try {
      const [usersChat, usershat] = await Promise.all([
        user.role === "SUPERVISOR" ? getUserChat() : Promise.resolve([]),
        getContactsApi(), // retorna string[]
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

  // ── Selecionar usuário: carrega do cache se existir ─────────────────────────
  setSelectedUser: (user) => {
    const { messageCache } = get()
    if (!user) {
      set({ selectedUser: null, messages: [] })
      return
    }

    const entry = messageCache.get(user.userId)
    set({
      selectedUser: user,
      messages: entry ? entry.items : [], // mostra mensagens imediatamente se estiverem em cache
    })
  },

  // ── Buscar mensagens com cache ──────────────────────────────────────────────
  getMessages: async (userId: string, opts?: { forceRefresh?: boolean }) => {
    const { messageCache } = get()
    const force = opts?.forceRefresh === true

    // 1) Tentar cache fresco
    const entry = messageCache.get(userId)
    const fresh = entry && (Date.now() - entry.fetchedAt) < TTL_MS

    if (entry && fresh && !force) {
      // já temos mensagens frescas: só garantir que o estado exiba isso
      set({ messages: entry.items })
      return
    }

    // 2) Buscar da API
    set({ isMessagesLoading: true })
    try {
      const res = await getMessageApi(userId)

      // normaliza (evita undefined)
      const items: TMessage[] = Array.isArray(res) ? res : []

      // atualiza estado
      set({ messages: items })

      // atualiza cache (LRU: se passar do limite, remove o primeiro)
      if (!messageCache.has(userId) && messageCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = messageCache.keys().next().value
        messageCache.delete(oldestKey)
      }
      // para manter ordem LRU, re-seta a chave
      messageCache.delete(userId)
      messageCache.set(userId, { items, fetchedAt: Date.now() })
      set({ messageCache: new Map(messageCache) })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao buscar mensagens")
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  // ── Enviar mensagem: atualiza estado + cache (otimista já com resp) ────────
  sendMessage: async (messageData: TMessageSend) => {
    const { selectedUser, messages, messageCache } = get()
    if (!selectedUser) return

    try {
      const resp = await sendMessageApi(selectedUser.userId, messageData)
      await ingestDigest(selectedUser.userId)

      // de-dup por _id
      const next = messages.some(m => m._id === resp._id) ? messages : [...messages, resp]
      set({ messages: next })

      // cache: LRU “touch” + atualizar itens
      const cached = messageCache.get(selectedUser.userId)
      const items = cached ? [...cached.items, resp] : next
      messageCache.delete(selectedUser.userId)
      messageCache.set(selectedUser.userId, { items, fetchedAt: Date.now() })
      set({ messageCache: new Map(messageCache) })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Erro ao enviar mensagem")
    }
  },

  // ── Socket: ao chegar nova mensagem do contato aberto, atualiza cache ──────
  subscribeToMessages: () => {
    const { selectedUser } = get()
    const socket = useAuthStore.getState().socket
    if (!selectedUser || !socket) return

    socket.on("newMessage", (newMessage: TMessage) => {
      // só mensagens vindas do contato selecionado (ou endereçadas a mim)
      const isFromSelected = newMessage.senderId === selectedUser.userId
      if (!isFromSelected) return

      const { messages, messageCache } = get()
      // de-dup
      const has = messages.some(m => m._id === newMessage._id)
      const next = has ? messages : [...messages, newMessage]
      set({ messages: next })

      const cached = messageCache.get(selectedUser.userId)
      const cachedItems = cached?.items ?? []
      const hasCached = cachedItems.some(m => m._id === newMessage._id)
      const updated = hasCached ? cachedItems : [...cachedItems, newMessage]

      messageCache.delete(selectedUser.userId)
      messageCache.set(selectedUser.userId, { items: updated, fetchedAt: Date.now() })
      set({ messageCache: new Map(messageCache) })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return
    socket.off("newMessage")
  },
}))
