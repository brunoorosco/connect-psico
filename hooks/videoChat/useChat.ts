"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatMessage, UseChatProps } from "./types"

export function useChat({ socket, roomId, userId, userName, avatar }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState<string[]>([])

  // Enviar mensagem
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !message.trim()) return

      const messageData = {
        roomId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }

      socket.emit("sendMessage", messageData)
    },
    [socket, roomId]
  )

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket) return

    // Receber mensagens
    const handleReceiveMessage = (data: {
      userId: string
      message: string
      timestamp: string
      avatar?: string
      userName?: string
    }) => {
      const newMessage: ChatMessage = {
        id: `${data.userId}-${Date.now()}-${Math.random()}`,
        userId: data.userId,
        message: data.message,
        timestamp: new Date(data.timestamp),
        avatar: data.avatar,
        userName: data.userName,
      }

      setMessages((prev) => [...prev, newMessage])
    }

    // Indicador de digitação (opcional - pode ser implementado posteriormente)
    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      setIsTyping((prev) => {
        if (data.isTyping) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId]
        } else {
          return prev.filter((id) => id !== data.userId)
        }
      })
    }

    socket.on("receiveMessage", handleReceiveMessage)
    socket.on("userTyping", handleUserTyping)

    return () => {
      socket.off("receiveMessage", handleReceiveMessage)
      socket.off("userTyping", handleUserTyping)
    }
  }, [socket])

  // Limpar mensagens quando sair da sala
  const clearMessages = useCallback(() => {
    setMessages([])
    setIsTyping([])
  }, [])

  // Indicar que está digitando (opcional)
  const setTyping = useCallback(
    (typing: boolean) => {
      if (!socket) return

      socket.emit("typing", { roomId, userId, isTyping: typing })
    },
    [socket, roomId, userId]
  )

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    setTyping,
  }
}
