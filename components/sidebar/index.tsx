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
import { LogOut } from "lucide-react";

export async function AppSidebar() {
  const session = await auth();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className='flex items-center'>
              <Link
                href='/'
                className='text-gray-700 hover:text-gray-900 h-4 pb-3'
              >
                <Logo />
              </Link>
            </div>
          </SidebarGroupLabel>
          <div className='mt-8'>
            <SidebarGroupContent>
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
                        <Link href={item.url}>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <LogoutButton>
                <Button
                  variant={"ghost"}
                  className='flex flex-1 justify-around'
                >
                  <menusFooter.icon />
                  <span>{menusFooter.title}</span>
                </Button>
              </LogoutButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
