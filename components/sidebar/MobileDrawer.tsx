"use client"
import React, { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { menus } from "./menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu, User } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/utils/getInitialsName"
import { ShareProfileButton } from "./sharedProfile"
import { env } from "@/config/application"

const MobileDrawer = () => {
  const navigate = useRouter()
  const user = useCurrentUser()
  const [isPending, startTransition] = useTransition()

  const handleNavigate = (url: string) => {
    startTransition(() => {
      navigate.push(url)
    })
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
                  <DrawerClose asChild key={item.title}>
                    <Button
                      key={item.title}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigate(item.url.replace("/{userId}", `/${user.id}`))}
                      disabled={isPending}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.title}
                      {/* {isPending ? "Carregando..." : item.title} */}
                    </Button>
                  </DrawerClose>
                ) : null
              })
            : Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-9 w-full rounded-md" />)}
          <DrawerClose asChild>
            <Button
              variant="ghost"
              onClick={() => navigate.push(`/app/professional/${user?.id}/profile`)}
              className="w-full justify-start"
              disabled={isPending}
            >
              <User/>
              Editar Perfil
            </Button>
          </DrawerClose>

          {user?.role === "SUPERVISOR" && (
            <>
              {/* <DrawerClose asChild>
                <Button
                  variant="ghost"
                  onClick={() => navigate.push(`/app/professional/${user.id}/minha-assinatura`)}
                  className="w-full justify-start"
                  disabled={isPending}
                >
                  Minha Assinatura
                </Button>
              </DrawerClose> */}

              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  onClick={() => navigate.push(`${env.urlBase}/terapeutas/${user.username}`)}
                  className="w-full justify-start"
                  disabled={isPending}
                >
                  Perfil Público
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <ShareProfileButton urlProfile={`${env.urlBase}/terapeutas/${user.username}`} />
              </DrawerClose>
            </>
          )}
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500"
              onClick={() => signOut()}
              disabled={!user}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </DrawerClose>
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
