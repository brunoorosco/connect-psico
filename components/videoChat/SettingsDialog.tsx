"use client"

import React, { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Button } from "@components/ui/button"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Separator } from "@components/ui/separator"
import { Mic, Video, Volume2, RefreshCw, Trash2, Info } from "lucide-react"
import { useMediaDevices } from "./useMediaDevices"
import { deviceStorage, type DevicePreferences, type StoredDevice } from "@/infra/storage/deviceStorage"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onDeviceChange?: (deviceId: string, kind: MediaDeviceKind) => void
}

export function SettingsDialog({ isOpen, onClose, onDeviceChange }: SettingsDialogProps) {
  const {
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioInput,
    selectedVideoInput,
    selectedAudioOutput,
    hasAudioPermission,
    hasVideoPermission,
    isLoading,
    error,
    requestPermissions,
    testAudioDevice,
    testVideoDevice,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
    refreshDevices,
  } = useMediaDevices()

  const [localSelectedAudioInput, setLocalSelectedAudioInput] = useState<string>("")
  const [localSelectedVideoInput, setLocalSelectedVideoInput] = useState<string>("")
  const [localSelectedAudioOutput, setLocalSelectedAudioOutput] = useState<string>("")
  const [testStream, setTestStream] = useState<MediaStream | null>(null)
  const [isTesting, setIsTesting] = useState<{ audio: boolean; video: boolean }>({ audio: false, video: false })
  const [storageStats, setStorageStats] = useState(deviceStorage.getStorageStats())

  const testVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadSavedPreferences()
      updateStorageStats()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedAudioInput && !localSelectedAudioInput) {
      setLocalSelectedAudioInput(selectedAudioInput)
    }
    if (selectedVideoInput && !localSelectedVideoInput) {
      setLocalSelectedVideoInput(selectedVideoInput)
    }
    if (selectedAudioOutput && !localSelectedAudioOutput) {
      setLocalSelectedAudioOutput(selectedAudioOutput)
    }
  }, [
    selectedAudioInput,
    selectedVideoInput,
    selectedAudioOutput,
    localSelectedAudioInput,
    localSelectedVideoInput,
    localSelectedAudioOutput,
  ])

  useEffect(() => {
    if (!isOpen && testStream) {
      testStream.getTracks().forEach((track) => track.stop())
      setTestStream(null)
      setIsTesting({ audio: false, video: false })
    }
  }, [isOpen, testStream])

  const loadSavedPreferences = () => {
    try {
      const currentDevices: StoredDevice[] = [
        ...audioInputs.map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind as MediaDeviceKind })),
        ...videoInputs.map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind as MediaDeviceKind })),
        ...audioOutputs.map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind as MediaDeviceKind })),
      ]

      deviceStorage.saveAvailableDevices(currentDevices)
      deviceStorage.cleanupPreferences(currentDevices)
      const finalPrefs = deviceStorage.selectDefaultDevices(currentDevices)

      if (finalPrefs.audioInputId) {
        setLocalSelectedAudioInput(finalPrefs.audioInputId)
      }
      if (finalPrefs.videoInputId) {
        setLocalSelectedVideoInput(finalPrefs.videoInputId)
      }
      if (finalPrefs.audioOutputId) {
        setLocalSelectedAudioOutput(finalPrefs.audioOutputId)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar preferências:", error)
    }
  }

  const updateStorageStats = () => {
    setStorageStats(deviceStorage.getStorageStats())
  }

  const handleRequestPermissions = async () => {
    try {
      await requestPermissions(true, true)
      await refreshDevices()
      loadSavedPreferences()
    } catch (error) {
      console.error("❌ Erro ao solicitar permissões:", error)
    }
  }

  const handleTestAudio = async () => {
    if (isTesting.audio) return

    try {
      setIsTesting((prev) => ({ ...prev, audio: true }))
      if (testStream) {
        testStream.getTracks().forEach((track) => track.stop())
        setTestStream(null)
      }
      const deviceId = localSelectedAudioInput || undefined
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      })
      setTestStream(stream)
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop())
        setTestStream(null)
        setIsTesting((prev) => ({ ...prev, audio: false }))
      }, 3000)
    } catch (error) {
      console.error("❌ Erro ao testar áudio:", error)
      setIsTesting((prev) => ({ ...prev, audio: false }))
    }
  }

  const handleTestVideo = async () => {
    if (isTesting.video) return

    try {
      setIsTesting((prev) => ({ ...prev, video: true }))
      if (testStream) {
        testStream.getTracks().forEach((track) => track.stop())
        setTestStream(null)
      }
      const deviceId = localSelectedVideoInput || undefined
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      setTestStream(stream)
      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream
      }
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop())
        setTestStream(null)
        setIsTesting((prev) => ({ ...prev, video: false }))
        if (testVideoRef.current) {
          testVideoRef.current.srcObject = null
        }
      }, 5000)
    } catch (error) {
      console.error("❌ Erro ao testar vídeo:", error)
      setIsTesting((prev) => ({ ...prev, video: false }))
    }
  }

  const handleSave = () => {
    try {
      const preferences: Partial<DevicePreferences> = {}
      if (localSelectedAudioInput) {
        preferences.audioInputId = localSelectedAudioInput
        selectAudioInput(localSelectedAudioInput)
      }
      if (localSelectedVideoInput) {
        preferences.videoInputId = localSelectedVideoInput
        selectVideoInput(localSelectedVideoInput)
      }
      if (localSelectedAudioOutput) {
        preferences.audioOutputId = localSelectedAudioOutput
        selectAudioOutput(localSelectedAudioOutput)
      }
      deviceStorage.saveDevicePreferences(preferences)
      if (onDeviceChange) {
        if (localSelectedAudioInput) onDeviceChange(localSelectedAudioInput, "audioinput")
        if (localSelectedVideoInput) onDeviceChange(localSelectedVideoInput, "videoinput")
        if (localSelectedAudioOutput) onDeviceChange(localSelectedAudioOutput, "audiooutput")
      }
      updateStorageStats()
      onClose()
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error)
    }
  }

  const handleClearPreferences = () => {
    deviceStorage.clearAll()
    setLocalSelectedAudioInput("")
    setLocalSelectedVideoInput("")
    setLocalSelectedAudioOutput("")
    updateStorageStats()
  }

  const handleRefreshDevices = async () => {
    try {
      await refreshDevices()
      loadSavedPreferences()
      updateStorageStats()
    } catch (error) {
      console.error("❌ Erro ao atualizar dispositivos:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações de Áudio e Vídeo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Status dos Dispositivos</h3>
              <Button variant="outline" size="sm" onClick={handleRefreshDevices} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Microfone: <span className={hasAudioPermission ? "text-green-600" : "text-red-600"}>
                {hasAudioPermission ? "✅ Permitido" : "❌ Sem permissão"}
              </span></div>
              <div>Câmera: <span className={hasVideoPermission ? "text-green-600" : "text-red-600"}>
                {hasVideoPermission ? "✅ Permitido" : "❌ Sem permissão"}
              </span></div>
              <div>Dispositivos: {audioInputs.length + videoInputs.length + audioOutputs.length}</div>
              <div>Preferências: {storageStats.hasPreferences ? "💾 Salvas" : "🆕 Padrão"}</div>
            </div>
            {(!hasAudioPermission || !hasVideoPermission) && (
              <Button onClick={handleRequestPermissions} className="w-full mt-3" variant="outline">
                Solicitar Permissões
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center">
                <Info className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Áudio */}
          <div>
            <Label>Microfone ({audioInputs.length} disponível)</Label>
            <Select value={localSelectedAudioInput || ""} onValueChange={setLocalSelectedAudioInput}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um microfone" />
              </SelectTrigger>
              <SelectContent>
                {audioInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId || ""}>
                    {device.label || `Dispositivo ${device.deviceId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alto-falante ({audioOutputs.length} disponível)</Label>
            <Select value={localSelectedAudioOutput || ""} onValueChange={setLocalSelectedAudioOutput}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um alto-falante" />
              </SelectTrigger>
              <SelectContent>
                {audioOutputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId || ""}>
                    {device.label || `Dispositivo ${device.deviceId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vídeo */}
          <div>
            <Label>Câmera ({videoInputs.length} disponível)</Label>
            <Select value={localSelectedVideoInput || ""} onValueChange={setLocalSelectedVideoInput}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma câmera" />
              </SelectTrigger>
              <SelectContent>
                {videoInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId || ""}>
                    {device.label || `Dispositivo ${device.deviceId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
