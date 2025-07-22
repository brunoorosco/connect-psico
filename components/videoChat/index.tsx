"use client"

import { useWebRTC } from "./useWebRTC"
import VideoStreams from "./VideoStreams"
import { CallControls } from "./CallControls"
import VideoContainer from "./VideoContainer"
import SettingsModal from "./SettingsModal"
import { useEffect, useRef, useState } from "react"
import PermissionScreen from "./PermissionScreen"
import { VideoCallScheduleMenu } from "./sidebarSchedules"

interface Props {
  remoteUserId: string
  isScheduledCall?: boolean
}

export default function VideoChat({ remoteUserId, isScheduledCall }: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const {
    localVideoRef,
    remoteVideoRef,
    permissionGranted,
    requestPermissionAndLoadDevices,
    startCall,
    videoDevices,
    audioDevices,
    selectedCamera,
    selectedMic,
    setSelectedCamera,
    setSelectedMic,
    toggleMic,
    toggleCamera,
    micEnabled,
    cameraEnabled,
    leaveCall,
    joinRoom,
  } = useWebRTC(remoteUserId)

  const hasJoined = useRef(false)

  useEffect(() => {
    if (isScheduledCall && permissionGranted && !hasJoined.current) {
      joinRoom()
      hasJoined.current = true
    }
  }, [isScheduledCall, permissionGranted])

  if (!permissionGranted) {
    return <PermissionScreen onAllow={requestPermissionAndLoadDevices} />
  }

  return (
    <>
      <VideoContainer>
        
        <VideoStreams localRef={localVideoRef} remoteRef={remoteVideoRef} />

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <CallControls
            onSettingsClick={() => setIsSettingsOpen(true)}
            micEnabled={micEnabled}
            cameraEnabled={cameraEnabled}
            toggleMic={toggleMic}
            toggleCamera={toggleCamera}
            leaveCall={leaveCall}
            inCall={!!remoteUserId}
            onStartCall={() => {
              joinRoom()
              startCall()
            }}
          />
        </div>

        {/* Modal de configurações */}
        <SettingsModal
          isOpen={isSettingsOpen}
          videoDevices={videoDevices}
          audioDevices={audioDevices}
          selectedCamera={selectedCamera}
          selectedMic={selectedMic}
          onCameraChange={setSelectedCamera}
          onMicChange={setSelectedMic}
          onClose={() => setIsSettingsOpen(false)}
        />
      </VideoContainer>
    </>
  )
}
