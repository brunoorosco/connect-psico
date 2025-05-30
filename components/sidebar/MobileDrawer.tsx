"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { menus } from "./menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Menu } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

type MobileDrawerProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "ADMIN" | "SUPERVISOR" | "DEFAULT";
  };
};

const MobileDrawer = () => {
  const navigate = useRouter();
  const user = useCurrentUser();
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

        <div className="flex items-center space-x-3 p-4">
          <Avatar>
            <AvatarImage src={user?.image as string} />
            <AvatarFallback>{getInitials(user?.name as string)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>

        <div className="px-4 py-2 space-y-4">
          {menus.map((item) => {
            const hasPermission =
              !item.rules || item.rules.length === 0 || item.rules.includes(user?.role as string);

            return hasPermission ? (
              <Button
                key={item.title}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate.push(item.url.replace("/{userId}", `/${user?.id}`))}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </Button>
            ) : null;
          })}
          {user?.role === "SUPERVISOR" && (
            <>
              <Button
                variant={"ghost"}
                onClick={() => navigate.push(`/app/professional/${user?.id}/minha-assinatura`)}
                className={"w-full justify-start"}
              >
                Minha Assinatura
              </Button>

              <Button
                variant={"ghost"}
                className={"w-full justify-start"}
                onClick={() => navigate.push(`/app/professional/${user?.id}/profile`)}
              >
                Perfil
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={() => {
              signOut();
            }}
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
  );
};

export default MobileDrawer;
