"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserTable from "@/components/admin/AdminUserTable";
import AdminRoleManagement from "@components/admin/AdminRoleManagement";

const AdminPanel = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Painel de Administração</h1>
        </header>

        <Tabs defaultValue="users" className="w-full">
          {/* TabsList com rolagem horizontal em mobile */}
          <div className="overflow-x-auto">
            <TabsList className="whitespace-nowrap flex w-max gap-2 px-1 sm:px-0">
              <TabsTrigger value="users" className="px-4 py-2 text-sm sm:text-base">
                Gerenciar Usuários
              </TabsTrigger>
              <TabsTrigger value="roles" className="px-4 py-2 text-sm sm:text-base">
                Gerenciar Permissões
              </TabsTrigger>
             
            </TabsList>
          </div>

          <TabsContent value="users" className="mt-6">
            <AdminUserTable />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <AdminRoleManagement />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Status de Pagamentos</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie o status de pagamento dos usuários.
              </p>
              <div className="mt-4">
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
