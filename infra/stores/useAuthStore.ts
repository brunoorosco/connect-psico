import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const BASE_URL = "http://localhost:4000";

interface AuthUser {
  id: string;
  name?: string;
  image?: string;
}

interface AuthStore {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;

  onlineUsers: string[];
  socket: Socket | null;

  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),

  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { authUser, socket } = get();
    console.log("Connecting socket...", authUser, socket);
    if (!authUser || socket?.connected) return;

    const newSocket: Socket = io(BASE_URL, {
      query: {
        userId: authUser.id,
      },
    });

    newSocket.connect();
    console.log("Socket connected");
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      console.log("Online users:", userIds);
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
