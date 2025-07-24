"use client"

import { useWebRTC } from "./useWebRTC"
import VideoStreams from "./VideoStreams"
import { CallControls } from "./CallControls"
import VideoContainer from "./VideoContainer"
import SettingsModal from "./SettingsModal"
import { useEffect, useRef, useState } from "react"
import PermissionScreen from "./PermissionScreen"

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
    inCall,
    socket
  } = useWebRTC(remoteUserId)


  const hasJoined = useRef(false)

  useEffect(() => {
    if (isScheduledCall && permissionGranted && !hasJoined.current) {
      joinRoom()
      hasJoined.current = true
    }
  }, [isScheduledCall, permissionGranted])
  
 useEffect(() => {
    if (!socket) return

    const handleCallStatus = ({ userId, inCall }: { userId: string; inCall: boolean }) => {
      if (userId === remoteUserId) {
        console.log("handleCallStatus",inCall)
        // setInCall(inCall)
      }
    }

    socket.on("call-status-updated", handleCallStatus)

    return () => {
      socket.off("call-status-updated", handleCallStatus)
    }
  }, [socket, remoteUserId])


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
            inCall={inCall}
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
