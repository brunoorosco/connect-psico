"use client"

import { env } from "@/config/application"
import { useCurrentUser } from "@hooks/use-current-user"
import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketContextProps {
  socket: Socket | null
}

const SocketContext = createContext<SocketContextProps>({ socket: null })

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const user = useCurrentUser();
  const userId = user?.id;

  useEffect(() => {
    const newSocket = io(env.baseUrlPsicomaisApi, {
      transports: ["websocket"],
      query: { userId },
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("✅ Socket conectado:", newSocket.id)
    })

    newSocket.on("disconnect", () => {
      console.log("❌ Socket desconectado")
    })

    return () => {
      newSocket.disconnect()
    }
  }, [userId])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
