"use client"

import { useCallStore } from "@/infra/stores/useCallStore"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Settings, Headphones } from "lucide-react"

interface Props {
  micEnabled: boolean
  cameraEnabled: boolean
  toggleMic: () => void
  toggleCamera: () => void
  onSettingsClick: () => void
  onStartCall: () => void
}

export const CallControls = ({
  micEnabled,
  cameraEnabled,
  toggleMic,
  toggleCamera,
  onSettingsClick,
  onStartCall,
}: Props) => {
  const inCall = useCallStore((s) => s.inCall)
  const leaveCall = useCallStore((s) => s.leaveCall)
  const setAudioOnly = useCallStore((s) => s.setAudioOnly)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-black/60 px-4 py-2 rounded-full">
      {!inCall ? (
        <>
          <button
            onClick={() => {
              setAudioOnly(false)
              onStartCall()
            }}
            className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition"
          >
            <Phone size={20} />
          </button>

          <button
            onClick={() => {
              setAudioOnly(true)
              onStartCall()
            }}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <Headphones size={20} />
          </button>
        </>
      ) : (
        <button
          onClick={() => leaveCall?.()}
          className="p-2 rounded-full bg-red-700 hover:bg-red-600 text-white transition"
        >
          <PhoneOff size={20} />
        </button>
      )}

      <button
        onClick={toggleMic}
        disabled={!inCall}
        className={`p-2 rounded-full text-white transition ${
          inCall
            ? micEnabled
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
            : "bg-gray-700 cursor-not-allowed"
        }`}
      >
        {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button
        onClick={toggleCamera}
        disabled={!inCall}
        className={`p-2 rounded-full text-white transition ${
          inCall
            ? cameraEnabled
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
            : "bg-gray-700 cursor-not-allowed"
        }`}
      >
        {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      <button
        onClick={onSettingsClick}
        className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600"
      >
        <Settings size={20} />
      </button>
    </div>
  )
}
