"use client"

import { useState, useEffect, useCallback, RefObject } from "react"

interface PictureInPictureState {
  isSupported: boolean
  isActive: boolean
  isLoading: boolean
  error: string | null
}

interface UsePictureInPictureReturn extends PictureInPictureState {
  togglePictureInPicture: () => Promise<void>
  enterPictureInPicture: () => Promise<void>
  exitPictureInPicture: () => Promise<void>
}

export function usePictureInPicture(videoRef: RefObject<HTMLVideoElement>): UsePictureInPictureReturn {
  const [state, setState] = useState<PictureInPictureState>({
    isSupported: false,
    isActive: false,
    isLoading: false,
    error: null,
  })

  // Verificar suporte para Picture-in-Picture
  const checkSupport = useCallback(() => {
    const isSupported = !!(
      document.pictureInPictureEnabled &&
      videoRef.current &&
      typeof videoRef.current.requestPictureInPicture === "function"
    )

    setState((prev) => ({ ...prev, isSupported }))

    if (!isSupported) {
      console.warn("⚠️ Picture-in-Picture não é suportado neste navegador")
    } else {
      console.log("✅ Picture-in-Picture suportado")
    }

    return isSupported
  }, [videoRef])

  // Entrar no modo Picture-in-Picture
  const enterPictureInPicture = useCallback(async () => {
    if (!videoRef.current) {
      const error = "Elemento de vídeo não encontrado"
      setState((prev) => ({ ...prev, error }))
      throw new Error(error)
    }

    if (!checkSupport()) {
      const error = "Picture-in-Picture não é suportado"
      setState((prev) => ({ ...prev, error }))
      throw new Error(error)
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      await videoRef.current.requestPictureInPicture()

      console.log("🖼️ Picture-in-Picture ativado")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("❌ Erro ao ativar Picture-in-Picture:", error)

      setState((prev) => ({
        ...prev,
        error: `Erro ao ativar Picture-in-Picture: ${errorMessage}`,
        isLoading: false,
      }))

      throw error
    }
  }, [videoRef, checkSupport])

  // Sair do modo Picture-in-Picture
  const exitPictureInPicture = useCallback(async () => {
    if (!document.pictureInPictureElement) {
      console.warn("⚠️ Nenhum elemento em Picture-in-Picture para sair")
      return
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      await document.exitPictureInPicture()

      console.log("🖼️ Picture-in-Picture desativado")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("❌ Erro ao desativar Picture-in-Picture:", error)

      setState((prev) => ({
        ...prev,
        error: `Erro ao desativar Picture-in-Picture: ${errorMessage}`,
        isLoading: false,
      }))

      throw error
    }
  }, [])

  // Alternar modo Picture-in-Picture
  const togglePictureInPicture = useCallback(async () => {
    try {
      if (state.isActive) {
        await exitPictureInPicture()
      } else {
        await enterPictureInPicture()
      }
    } catch (error) {
      console.error("❌ Erro ao alternar Picture-in-Picture:", error)
    }
  }, [state.isActive, enterPictureInPicture, exitPictureInPicture])

  // Event listeners para Picture-in-Picture
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleEnterPiP = () => {
      setState((prev) => ({
        ...prev,
        isActive: true,
        isLoading: false,
        error: null,
      }))
      console.log("🖼️ Entrou no Picture-in-Picture")
    }

    const handleLeavePiP = () => {
      setState((prev) => ({
        ...prev,
        isActive: false,
        isLoading: false,
        error: null,
      }))
      console.log("🖼️ Saiu do Picture-in-Picture")
    }

    const handlePiPError = (event: Event) => {
      const error = "Erro no Picture-in-Picture"
      setState((prev) => ({
        ...prev,
        error,
        isLoading: false,
      }))
      console.error("❌ Erro no Picture-in-Picture:", event)
    }

    // Adicionar event listeners
    videoElement.addEventListener("enterpictureinpicture", handleEnterPiP)
    videoElement.addEventListener("leavepictureinpicture", handleLeavePiP)
    videoElement.addEventListener("error", handlePiPError)

    // Cleanup
    return () => {
      videoElement.removeEventListener("enterpictureinpicture", handleEnterPiP)
      videoElement.removeEventListener("leavepictureinpicture", handleLeavePiP)
      videoElement.removeEventListener("error", handlePiPError)
    }
  }, [videoRef])

  // Verificar suporte na inicialização
  useEffect(() => {
    checkSupport()
  }, [checkSupport])

  // Verificar se há elemento em PiP ao montar
  useEffect(() => {
    const checkCurrentPiPState = () => {
      const isCurrentlyInPiP = document.pictureInPictureElement === videoRef.current
      setState((prev) => ({ ...prev, isActive: isCurrentlyInPiP }))
    }

    checkCurrentPiPState()

    // Listener para mudanças no estado global de PiP
    const handlePiPChange = () => {
      checkCurrentPiPState()
    }

    document.addEventListener("fullscreenchange", handlePiPChange)
    document.addEventListener("webkitfullscreenchange", handlePiPChange)

    return () => {
      document.removeEventListener("fullscreenchange", handlePiPChange)
      document.removeEventListener("webkitfullscreenchange", handlePiPChange)
    }
  }, [videoRef])

  return {
    ...state,
    togglePictureInPicture,
    enterPictureInPicture,
    exitPictureInPicture,
  }
}
