import { create } from "zustand"
import { io, Socket } from "socket.io-client"
import { env } from "@/config/application"

const BASE_URL = env.baseUrlPsicomaisApi

interface AuthUser {
  id: string
  name?: string
  image?: string
}

interface AuthStore {
  authUser: AuthUser | null
  setAuthUser: (user: AuthUser | null) => void

  onlineUsers: string[]
  socket: Socket | null

  connectSocket: () => void
  disconnectSocket: () => void

  onOffer?: (data: { offer: RTCSessionDescriptionInit; from: string }) => void
  onAnswer?: (data: { answer: RTCSessionDescriptionInit; from: string }) => void
  onIceCandidate?: (data: { candidate: RTCIceCandidateInit; from: string }) => void

  setOnOffer: (handler: AuthStore["onOffer"]) => void
  setOnAnswer: (handler: AuthStore["onAnswer"]) => void
  setOnIceCandidate: (handler: AuthStore["onIceCandidate"]) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),

  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { authUser, socket } = get()
    if (!authUser || socket?.connected) return

    const newSocket: Socket = io(BASE_URL, {
      query: {
        userId: authUser.id,
      },
    })

    newSocket.connect()
    set({ socket: newSocket })

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      console.log("Online users:", userIds)
      set({ onlineUsers: userIds })
    })

    newSocket.on("offer", (data) => get().onOffer?.(data))
    newSocket.on("answer", (data) => get().onAnswer?.(data))
    newSocket.on("ice-candidate", (data) => get().onIceCandidate?.(data))
    newSocket.on("disconnect", () => {
      console.warn("Socket disconnected. Reconnecting...");
      setTimeout(() => {
        get().connectSocket();
      }, 1000);
    });
  },
  
  disconnectSocket: () => {
    const socket = get().socket
    if (socket?.connected) socket.disconnect()
  },

  setOnOffer: (handler) => set({ onOffer: handler }),
  setOnAnswer: (handler) => set({ onAnswer: handler }),
  setOnIceCandidate: (handler) => set({ onIceCandidate: handler }),
}))
