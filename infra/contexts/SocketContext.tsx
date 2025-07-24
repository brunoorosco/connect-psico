// contexts/SocketContext.tsx
"use client"

import { createContext, useContext, useEffect } from "react"
import { useAuthStore } from "@/infra/stores/useAuthStore"

interface SocketContextProps {
  connectSocket: () => void
  disconnectSocket: () => void
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connectSocket, disconnectSocket, authUser, socket } = useAuthStore()

  useEffect(() => {
    if (authUser) connectSocket()

    return () => disconnectSocket()
  }, [authUser])

  return <SocketContext.Provider value={{ connectSocket, disconnectSocket }}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
