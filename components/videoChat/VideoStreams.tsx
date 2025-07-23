// components/video-chat/VideoStreams.tsx
type Props = {
  localRef: React.RefObject<HTMLVideoElement>
  remoteRef: React.RefObject<HTMLVideoElement>
}

export default function VideoStreams({ localRef, remoteRef }: Props) {
  return (
    <>
      <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
      <video
        ref={localRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white shadow-lg object-cover bg-black"
      />
    </>
  )
}
