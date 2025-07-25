// src/infra/stores/useCallStore.ts
import { create } from "zustand"

interface CallState {
  inCall: boolean
  minimized: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  roomId?: string
  remoteUserId?: string
  leaveCall?: () => void
  setLeaveCall: (fn: () => void) => void
  setInCall: (v: boolean) => void
  setMinimized: (v: boolean) => void
  setLocalStream: (s: MediaStream | null) => void
  setRemoteStream: (s: MediaStream | null) => void
  setMeta: (data: { roomId?: string; remoteUserId?: string }) => void
  reset: () => void
  audioOnly: boolean
  setAudioOnly: (v: boolean) => void
  cameraEnabled: boolean
  setCameraEnabled: (v:boolean) => void
  authUser: any
  setAuthUser: (user:any) => void
  
}

export const useCallStore = create<CallState>((set) => ({
  inCall: false,
  minimized: false,
  localStream: null,
  remoteStream: null,
  roomId: undefined,
  remoteUserId: undefined,leaveCall: undefined,
  audioOnly: false,
  setAudioOnly: (v) => set({ audioOnly: v }),
  setLeaveCall: (fn) => set({ leaveCall: fn }),
  setInCall: (v) => set({ inCall: v }),
  setMinimized: (v) => set({ minimized: v }),
  setLocalStream: (s) => set({ localStream: s }),
  setRemoteStream: (s) => set({ remoteStream: s }),
  setMeta: (data) => set(data),
  cameraEnabled: true,
setCameraEnabled: (v) => set({ cameraEnabled: v }),
authUser: null,
setAuthUser: (user) => set({ authUser: user }),
  reset: () =>
    set({
      inCall: false,
      minimized: false,
      localStream: null,
      remoteStream: null,
      roomId: undefined,
      remoteUserId: undefined,
    }),
}))
