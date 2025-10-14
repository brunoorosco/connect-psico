import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { menus } from "./menu"
import Link from "next/link"
import Logo from "../logo"
import { auth } from "@/auth"
import LogoutButton from "../auth/logout-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings, ViewIcon, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { env } from "@/config/application"
import { ShareProfileButton } from "./sharedProfile"

export async function AppSidebar() {
  const session = await auth()
  const urlBase = session?.user.role === "SUPERVISOR" ? "/app/professional" : "/app/users"
  const urlProfile = `${urlBase}/${session?.user.id}/profile`
  const urlMinhaConta = `${urlBase}/${session?.user.id}/minha-assinatura`
  const urlMeusPagamentos = `${urlBase}/${session?.user.id}/pagamentos`

  const getInitials = (name: string) => {
    const nameParts = name.split(" ")
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Sidebar className="dark:bg-zinc-600 dark:text-zinc-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center mx-auto mt-2">
              <Link href="/" className="flex items-center">
                <Logo />

                <span className="text-2xl font-bold text-therapy-primary">{env.applicationName}</span>
              </Link>
            </div>
          </SidebarGroupLabel>
          <div className="mt-8">
            <SidebarGroupContent>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarMenu>
                {menus.map((item) => {
                  const hasPermission =
                    !item.rules || item.rules.length === 0 || item.rules.includes(session?.user.role as string)

                  return hasPermission ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url.replace("/{userId}", `/${session?.user.id}`)}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 cursor-pointer max-w-full overflow-hidden">
              <Avatar className="flex-shrink-0">
                <AvatarImage src={session?.user?.image as string} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(session?.user.name as string)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                {" "}
                {/* min-w-0 é essencial para o truncate funcionar */}
                <span className="font-medium text-sm truncate">{session?.user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{session?.user.email}</span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={urlProfile}>
                <User className="w-4 h-4 mr-2" />
                Editar Perfil
              </Link>
            </DropdownMenuItem>

            {session?.user.role === "SUPERVISOR" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`${env.urlBase}/terapeutas/${session?.user.username}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Perfil Público
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <ShareProfileButton urlProfile={`${env.urlBase}/terapeutas/${session?.user.username}`} />
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={urlMinhaConta}>
                    <Settings className="w-4 h-4 mr-2" /> Minha Assinatura
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <LogoutButton>
              <DropdownMenuItem className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
