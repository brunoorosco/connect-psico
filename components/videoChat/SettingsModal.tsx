"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog" // componente do shadcn/ui
import { X } from "lucide-react"
import { useEffect, useRef } from "react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
  selectedCamera: string
  selectedMic: string
  onCameraChange: (deviceId: string) => void
  onMicChange: (deviceId: string) => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  videoDevices,
  audioDevices,
  selectedCamera,
  selectedMic,
  onCameraChange,
  onMicChange,
}: SettingsModalProps) {
  const previewRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const setupPreview = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
      })
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        previewRef.current.play()
      }
    }

    setupPreview()

    return () => {
      if (previewRef.current?.srcObject) {
        const tracks = (previewRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
        previewRef.current.srcObject = null
      }
    }
  }, [isOpen, selectedCamera])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-lg p-6">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        {/* <button
          aria-label="Fechar"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X size={20} />
        </button> */}

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Câmera</label>
            <select
              className="w-full rounded border p-2"
              value={selectedCamera}
              onChange={(e) => onCameraChange(e.target.value)}
            >
              {videoDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Microfone</label>
            <select
              className="w-full rounded border p-2"
              value={selectedMic}
              onChange={(e) => onMicChange(e.target.value)}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pré-visualização</label>
            <video
              ref={previewRef}
              className="w-full rounded bg-black"
              muted
              playsInline
              autoPlay
              style={{ width: "480px", height: "320px", objectFit: "cover" }}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={onClose} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
