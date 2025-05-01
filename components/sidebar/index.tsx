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
import useDynamicMenus, { menus, menusFooter } from "./menu";
import Link from "next/link";
import Logo from "../logo";
import { auth } from "@/auth";
import LogoutButton from "../auth/logout-button";
import { Button } from "../ui";

export async function AppSidebar() {
  const session = await auth();

  return (
    <Sidebar className='dark:bg-zinc-600 dark:text-zinc-200'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className='flex items-center'>
              <Link
                href='/'
                //  className='text-gray-700 hover:text-gray-900 h-4 pb-3 dark:text-gray-100'
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
                        <Link
                          href={item.url.replace(
                            "/{userId}",
                            `/${session?.user.id}`
                          )}
                        >
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
      <SidebarFooter className="w-full">
        <SidebarMenu>
          <SidebarMenuItem className='hover:bg-primary-light cursor-pointer rounded-md w-full'>
            <SidebarMenuButton asChild>
              <LogoutButton>
                <Button
                 
                  className='flex flex-1 w-full'
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
