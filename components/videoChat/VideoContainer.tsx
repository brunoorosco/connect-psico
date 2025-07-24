import { ReactNode } from "react"

export default function VideoContainer({ children }: { children: ReactNode }) {
  return (
   <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {children}
    </div>
  )
}
