import { ReactNode } from "react"

export default function VideoContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-black text-white overflow-hidden">
      {children}
    </div>
  )
}
