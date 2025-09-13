"use client"
import MobileDrawer from "@/components/sidebar/MobileDrawer"
import { useEffect, useState } from "react"
export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")

    const handleResize = () => {
      setIsMobile(mediaQuery.matches)
    }

    handleResize()
    mediaQuery.addEventListener("change", handleResize)

    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm">
      <div>
        {isMobile ? (
          <div className="max-w-8xl mx-auto px-2 sm:px-6 lg:px-10 py-3 flex justify-end">
            <MobileDrawer />
          </div>
        ) : (
          <></>
        )}
      </div>
    </header>
  )
}
