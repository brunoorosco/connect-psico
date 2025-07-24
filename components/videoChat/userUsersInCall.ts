import { useEffect, useState } from "react"
import { io } from "socket.io-client"

export const useUsersInCall = (myUserId: string) => {
  const [usersInCall, setUsersInCall] = useState<string[]>([])

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      query: { userId: myUserId },
    })

    socket.on("call-status-updated", ({ userId, inCall }) => {
      setUsersInCall((prev) => {
        if (inCall) return [...new Set([...prev, userId])]
        return prev.filter((id) => id !== userId)
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [myUserId])

  return usersInCall
}
