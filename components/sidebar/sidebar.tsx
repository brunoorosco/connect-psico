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
} from "@/components/ui/sidebar";
import { menus, menusFooter } from "./menu";
import Link from "next/link";
import Logo from "../logo";
import { auth } from "@/auth";
import LogoutButton from "../auth/logout-button";
import { Button } from "../ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export async function AppSidebar() {
  const session = await auth();
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar className="dark:bg-zinc-600 dark:text-zinc-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center">
              <Link
                href="/"
                //  className='text-gray-700 hover:text-gray-900 h-4 pb-3 dark:text-gray-100'
              >
                <Logo />
              </Link>
            </div>
          </SidebarGroupLabel>
          <div className="mt-8">
            <SidebarGroupContent>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarMenu>
                {menus.map((item) => {
                  // Verifica se o item deve ser exibido
                  const hasPermission =
                    !item.rules ||
                    item.rules.length === 0 ||
                    item.rules.includes(session?.user.role as string);

                  return hasPermission ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url.replace("/{userId}", `/${session?.user.id}`)}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null; // Não renderiza o item se o usuário não tiver permissão
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t mt-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={session?.user?.image as string} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(session?.user.name as string)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{session?.user.name}</span>
              <span className="text-xs text-muted-foreground">{session?.user.email}</span>
            </div>
          </div>
          <LogoutButton >
            <Button
              variant="ghost"
              className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-100">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </LogoutButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
