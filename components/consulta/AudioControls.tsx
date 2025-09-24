import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

type Props = {
  isRecording: boolean
  time: number
  onStart: () => void
  onStop: () => void
}

export function AudioControls({ isRecording, time, onStart, onStop }: Props) {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        onClick={isRecording ? onStop : onStart}
        variant={isRecording ? "destructive" : "default"}
        className="w-full sm:w-auto flex items-center gap-2"
      >
        {isRecording ? <MicOff /> : <Mic />}
        {isRecording ? "Parar" : "Gravar"}
      </Button>

      {isRecording && <span className="text-sm font-mono text-center sm:text-left">{formatTime(time)}</span>}
    </div>
  )
}
