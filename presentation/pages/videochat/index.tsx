"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, MessageSquare, Settings, Smartphone, Tablet, Monitor } from "lucide-react"
import { useDeviceDetection } from "@hooks/videoChat"

export function VideoChat() {
  const [roomId, setRoomId] = useState("")
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const deviceInfo = useDeviceDetection()

  const generateRoomId = () => {
    const id = "room-" + Math.random().toString(36).substr(2, 9)
    setRoomId(id)
  }

  const generateUserId = () => {
    const id = "user-" + Math.random().toString(36).substr(2, 9)
    setUserId(id)
  }

  const joinCall = () => {
    if (!roomId || !userId) {
      alert("Por favor, preencha o ID da sala e do usuário")
      return
    }

    // Verificar suporte WebRTC
    if (!deviceInfo.supportsWebRTC) {
      alert("Seu navegador não suporta videochamadas. Tente usar Chrome, Firefox ou Safari mais recente.")
      return
    }

    if (!deviceInfo.supportsGetUserMedia) {
      alert("Seu navegador não permite acesso à câmera e microfone. Verifique as configurações de permissão.")
      return
    }

    const params = new URLSearchParams({
      userId,
      ...(userName && { userName }),
    })

    window.location.href = `/video-call/room/${roomId}?${params.toString()}`
  }

  // Ícone do dispositivo baseado na detecção
  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="w-4 h-4" />
    if (deviceInfo.isTablet) return <Tablet className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Device Info Banner */}
      {deviceInfo.isMobile && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-blue-200 text-sm">
            {getDeviceIcon()}
            <span>Dispositivo móvel detectado - Interface otimizada para {deviceInfo.isIOS ? "iOS" : "Android"}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4">VideoChat Terapia</h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Plataforma de videochamadas para conectar terapeutas e pacientes de forma segura e profissional
          </p>
        </div>

        {/* Features Grid - Responsivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="text-center p-3 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1 md:mb-2">Vídeo HD</h3>
            <p className="text-gray-300 text-xs md:text-sm hidden md:block">
              Qualidade de vídeo cristalina para consultas profissionais
            </p>
          </div>

          <div className="text-center p-3 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1 md:mb-2">Múltiplos</h3>
            <p className="text-gray-300 text-xs md:text-sm hidden md:block">
              Suporte para sessões individuais e em grupo
            </p>
          </div>

          <div className="text-center p-3 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 bg-purple-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1 md:mb-2">Chat</h3>
            <p className="text-gray-300 text-xs md:text-sm hidden md:block">Comunicação por texto durante as sessões</p>
          </div>

          <div className="text-center p-3 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 bg-orange-500 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1 md:mb-2">Config</h3>
            <p className="text-gray-300 text-xs md:text-sm hidden md:block">
              Controle total sobre áudio, vídeo e dispositivos
            </p>
          </div>
        </div>

        {/* Main Form - Mobile First */}
        <div className="max-w-sm md:max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl md:text-2xl text-white">Entrar na Videochamada</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Preencha os dados abaixo para entrar em uma sala
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ID da Sala */}
              <div className="space-y-2">
                <label htmlFor="roomId" className="text-sm font-medium text-white">
                  ID da Sala
                </label>
                <div className="flex space-x-2">
                  <input
                    id="roomId"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Ex: room-123"
                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  />
                  <button
                    onClick={generateRoomId}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-10 px-3 md:px-4 py-2 min-w-[60px]"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              {/* ID do Usuário */}
              <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium text-white">
                  ID do Usuário
                </label>
                <div className="flex space-x-2">
                  <input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Ex: user-123"
                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  />
                  <button
                    onClick={generateUserId}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-10 px-3 md:px-4 py-2 min-w-[60px]"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="userName" className="text-sm font-medium text-white">
                  Nome (Opcional)
                </label>
                <input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu nome"
                  className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                />
              </div>

              {/* Botão de Entrar */}
              <button
                onClick={joinCall}
                disabled={!deviceInfo.supportsWebRTC}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed h-11 px-8 w-full"
              >
                {deviceInfo.supportsWebRTC ? "Entrar na Videochamada" : "Navegador não suportado"}
              </button>

              {/* Aviso de compatibilidade */}
              {!deviceInfo.supportsWebRTC && (
                <div className="text-center text-xs text-red-300 bg-red-500/20 rounded-md p-2">
                  Seu navegador não suporta videochamadas. Use Chrome, Firefox ou Safari mais recente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions - Simplificadas para mobile */}
        <div className="max-w-4xl mx-auto mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8">Como usar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                1
              </div>
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Gere um ID de sala</h4>
              <p className="text-gray-300 text-sm">Use o botão "Gerar" ou insira um ID existente</p>
            </div>

            <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                2
              </div>
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Defina seu ID</h4>
              <p className="text-gray-300 text-sm">Gere um ID único ou use um específico</p>
            </div>

            <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                3
              </div>
              <h4 className="text-base md:text-lg font-semibold text-white mb-2">Entre na chamada</h4>
              <p className="text-gray-300 text-sm">Permita acesso à câmera e microfone</p>
            </div>
          </div>
        </div>

        {/* Device Info Debug (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-black/20 rounded-lg text-xs text-gray-300">
            <h3 className="font-bold mb-2">Debug - Info do Dispositivo:</h3>
            <div className="space-y-1">
              <div>Tipo: {deviceInfo.isMobile ? "Mobile" : deviceInfo.isTablet ? "Tablet" : "Desktop"}</div>
              <div>OS: {deviceInfo.isIOS ? "iOS" : deviceInfo.isAndroid ? "Android" : "Outro"}</div>
              <div>
                Tela: {deviceInfo.screenSize} ({deviceInfo.orientation})
              </div>
              <div>WebRTC: {deviceInfo.supportsWebRTC ? "✅" : "❌"}</div>
              <div>getUserMedia: {deviceInfo.supportsGetUserMedia ? "✅" : "❌"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
