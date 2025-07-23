// components/video-chat/DeviceSelector.tsx
type Props = {
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
  selectedCamera: string
  selectedMic: string
  onCameraChange: (id: string) => void
  onMicChange: (id: string) => void
}

export default function DeviceSelector({
  videoDevices,
  audioDevices,
  selectedCamera,
  selectedMic,
  onCameraChange,
  onMicChange,
}: Props) {
  return (
    <div className="absolute top-4 left-4 bg-white text-black p-4 rounded-md shadow space-y-2 w-64">
      <div>
        <label className="block text-sm font-semibold mb-1">Câmera</label>
        <select className="w-full p-2 border rounded" value={selectedCamera} onChange={(e) => onCameraChange(e.target.value)}>
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Câmera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Microfone</label>
        <select className="w-full p-2 border rounded" value={selectedMic} onChange={(e) => onMicChange(e.target.value)}>
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microfone ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
