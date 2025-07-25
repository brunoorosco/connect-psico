import { useCallStore } from "@/infra/stores/useCallStore"
import { Avatar, AvatarFallback } from "@components/ui/avatar"

type Props = {
  localRef: React.RefObject<HTMLVideoElement>
  remoteRef: React.RefObject<HTMLVideoElement>
}

export default function VideoStreams({ localRef, remoteRef }: Props) {
  const cameraEnabled = useCallStore((s) => s.cameraEnabled)
  const authUser = useCallStore((s) => s.authUser)

  return (
    <>
      {cameraEnabled ? (
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white shadow-lg object-cover bg-black"
        />
      ) : (
        <div className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white shadow-lg flex items-center justify-center bg-zinc-800 text-white">
          <Avatar className="w-16 h-16">
            <AvatarFallback>
              {authUser?.name
                ?.split(" ")
                .map((n: any[]) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
    </>
  )
}
