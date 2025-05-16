'use client'
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
import { Menu, Home, Users, User, LogOut, Settings, Calendar } from "lucide-react";
import { signOut } from "next-auth/react";

interface MobileDrawerProps {
  userRole: "admin" | "supervisor" | "default";
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ userRole }) => {
  const navigate = useRouter();

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
        <div className="px-4 py-2 space-y-4">
          {/* Common items for all users */}
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate.push("/dashboard")}>
            <Home className="mr-2 h-5 w-5" />
            Dashboard
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate.push("/profissionais")}
          >
            <Users className="mr-2 h-5 w-5" />
            Profissionais
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate.push("/consulta")}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Consultas
          </Button>

          {/* Admin-specific menu items */}
          {userRole === "admin" && (
            <>
              <div className="py-2">
                <div className="h-px bg-gray-200" />
                <h3 className="mt-2 text-sm font-medium text-gray-500">Administração</h3>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate.push("/admin/supervisores")}
              >
                <Users className="mr-2 h-5 w-5" />
                Supervisores
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate.push("/admin/configuracoes")}
              >
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </Button>
            </>
          )}

          {/* Supervisor-specific menu items */}
          {userRole === "supervisor" && (
            <>
              <div className="py-2">
                <div className="h-px bg-gray-200" />
                <h3 className="mt-2 text-sm font-medium text-gray-500">Supervisão</h3>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate.push("/supervisor/usuarios")}
              >
                <Users className="mr-2 h-5 w-5" />
                Usuários
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate.push("/supervisor/relatorios")}
              >
                <Settings className="mr-2 h-5 w-5" />
                Relatórios
              </Button>
            </>
          )}

          {/* User profile and logout */}
          <div className="py-2">
            <div className="h-px bg-gray-200" />
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate.push("/perfil")}
          >
            <User className="mr-2 h-5 w-5" />
            Perfil
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={() => {signOut();}}
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
