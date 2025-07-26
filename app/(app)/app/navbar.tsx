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
          // <nav className="flex items-center space-x-4">
          //   {user?.role === "SUPERVISOR" && (
          //     <>
          //       <Link
          //         href={`/app/professional/${session?.id}/minha-assinatura`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/professional/${session?.id}/minha-assinatura`
          //               ? "underline"
          //               : ""
          //           )}
          //         >
          //           Minha Assinatura
          //         </Button>
          //       </Link>
          //       <Link
          //         href={`/app/professional/${session?.id}/profile`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/professional/${session?.id}/profile` ? "underline" : ""
          //           )}
          //         >
          //           Perfil
          //         </Button>
          //       </Link>
          //     </>
          //   )}
          //   {user?.role === "DEFAULT" && (
          //     <>
          //       <Link
          //         href={`/app/users/${session?.id}/minha-assinatura`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/users/${session?.id}/minha-assinatura` ? "underline" : ""
          //           )}
          //         >
          //           Minha Assinatura
          //         </Button>
          //       </Link>
          //       <Link
          //         href={`/app/users/${session?.id}/profile`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/users/${session?.id}/profile` ? "underline" : ""
          //           )}
          //         >
          //           Perfil
          //         </Button>
          //       </Link>
          //     </>
          //   )}
          //   {user?.role === "ADMIN" && (
          //     <>
          //       <Link
          //         href={`/app/admin/${session?.id}/minha-assinatura`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/admin/${session?.id}/minha-assinatura` ? "underline" : ""
          //           )}
          //         >
          //           Minha Assinatura
          //         </Button>
          //       </Link>
          //       <Link
          //         href={`/app/admin/${session?.id}/profile`}
          //         className="text-gray-700 hover:text-gray-900"
          //       >
          //         <Button
          //           variant={"link"}
          //           className={cn(
          //             pathname === `/app/admin/${session?.id}/profile` ? "underline" : ""
          //           )}
          //         >
          //           Perfil
          //         </Button>
          //       </Link>
          //     </>
          //   )}
          // </nav>
        )}
      </div>
    </header>
  )
}
