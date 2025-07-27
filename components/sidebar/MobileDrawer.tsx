"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { menus } from "./menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Skeleton } from "@/components/ui/skeleton" // Certifique-se de ter esse componente

const MobileDrawer = () => {
  const navigate = useRouter()
  const user = useCurrentUser()

  const getInitials = (name?: string) => {
    if (!name) return "?"
    const nameParts = name.trim().split(" ")
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const renderUserInfo = () => {
    if (!user) {
      return (
        <div className="flex items-center space-x-3 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-3 p-4">
        <Avatar>
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{getInitials(user.name || "")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>

        {renderUserInfo()}

        <div className="px-4 py-2 space-y-4">
          {user
            ? menus.map((item) => {
                const hasPermission = !item.rules || item.rules.length === 0 || item.rules.includes(user.role)

                return hasPermission ? (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate.push(item.url.replace("/{userId}", `/${user.id}`))}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </Button>
                ) : null
              })
            : Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-9 w-full rounded-md" />)}

          {user?.role === "SUPERVISOR" && (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate.push(`/app/professional/${user.id}/minha-assinatura`)}
                className="w-full justify-start"
              >
                Minha Assinatura
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate.push(`/app/professional/${user.id}/profile`)}
                className="w-full justify-start"
              >
                Perfil
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={() => signOut()}
            disabled={!user}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </div>

        <div className="p-4">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Fechar
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileDrawer
