"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserTable from "@/components/admin/AdminUserTable";
import AdminRoleManagement from "@/components/admin/AdminRoleManagement";
import { useRouter } from "next/navigation";
import { ProfessionalModel } from "@/domain/model/professional";

type Props = {
  professional: ProfessionalModel[];
};

const AdminPanel = ({ professional }: Props) => {

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Painel de Administração</h1>

        <Tabs defaultValue="users" className="w-full">
          {/* TabsList com scroll horizontal em mobile */}
          <TabsList className="overflow-x-auto whitespace-nowrap max-w-full flex">
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="roles">Gerenciar Permissões</TabsTrigger>
            <TabsTrigger value="payments">Status de Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <AdminUserTable professional={professional} />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <AdminRoleManagement professionals={professional} />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Status de Pagamentos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie o status de pagamento dos usuários.
            </p>
            <div className="mt-4">
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
