import { useState } from "react";
import { Loader2, Shield, ShieldX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUserPagination } from "@/hooks/useUserPagination";
import { AdminTableLayout } from "./AdminTableLayout";
import { Button } from "@components/ui/button";

const AdminRoleManagement = () => {
  const { toast } = useToast();
  const { users, search, setSearch, page, setPage, totalPages, loading, limit, setLimit } =
    useUserPagination();

  const [processingUsers, setProcessingUsers] = useState<Record<string, string>>({});

  const updateUserRole = async (
    userId: string,
    role: "ADMIN" | "SUPERVISOR",
    shouldHaveRole: boolean
  ) => {
    setProcessingUsers((prev) => ({ ...prev, [userId + role]: role }));

    try {
      toast({
        title: "Permissão atualizada",
        description: `Usuário ${shouldHaveRole ? "promovido a" : "removido de"} ${
          role === "ADMIN" ? "administrador" : "supervisor"
        }!`,
      });
    } catch (error) {
      console.error(`Erro ao atualizar ${role}:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões do usuário",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers((prev) => ({ ...prev, [userId + role]: "" }));
    }
  };

  return (
    <AdminTableLayout
      title="Gerenciar Permissões"
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Buscar por nome e email..."
      limit={limit}
      setLimit={setLimit}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      loading={loading}
    >
      {/* Tabela para telas grandes */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Administrador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.role === "ADMIN" && <Badge variant="destructive">Admin</Badge>}
                    {user.role === "SUPERVISOR" && <Badge variant="secondary">Supervisor</Badge>}
                    {user.role === "DEFAULT" && <Badge variant="outline">Usuário</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.role === "SUPERVISOR" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateUserRole(user.id, "SUPERVISOR", user.role !== "SUPERVISOR")
                    }
                    disabled={!!processingUsers[user.id + "SUPERVISOR"]}
                  >
                    {processingUsers[user.id + "SUPERVISOR"] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.role === "SUPERVISOR" ? (
                      <>
                        <ShieldX className="mr-1 h-4 w-4" /> Remover
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1 h-4 w-4" /> Promover
                      </>
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.role === "ADMIN" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateUserRole(user.id, "ADMIN", user.role !== "ADMIN")}
                    disabled={!!processingUsers[user.id + "ADMIN"]}
                  >
                    {processingUsers[user.id + "ADMIN"] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.role === "ADMIN" ? (
                      <>
                        <ShieldX className="mr-1 h-4 w-4" /> Remover
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1 h-4 w-4" /> Promover
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Layout mobile em cards */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-4 shadow-sm space-y-2 bg-white dark:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {user.role === "ADMIN" && <Badge variant="destructive">Admin</Badge>}
              {user.role === "SUPERVISOR" && <Badge variant="secondary">Supervisor</Badge>}
              {user.role === "DEFAULT" && <Badge variant="outline">Usuário</Badge>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={user.role === "SUPERVISOR" ? "destructive" : "outline"}
                size="sm"
                onClick={() => updateUserRole(user.id, "SUPERVISOR", user.role !== "SUPERVISOR")}
                disabled={!!processingUsers[user.id + "SUPERVISOR"]}
              >
                {processingUsers[user.id + "SUPERVISOR"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : user.role === "SUPERVISOR" ? (
                  <>
                    <ShieldX className="mr-1 h-4 w-4" /> Remover Supervisor
                  </>
                ) : (
                  <>
                    <Shield className="mr-1 h-4 w-4" /> Promover Supervisor
                  </>
                )}
              </Button>

              <Button
                variant={user.role === "ADMIN" ? "destructive" : "outline"}
                size="sm"
                onClick={() => updateUserRole(user.id, "ADMIN", user.role !== "ADMIN")}
                disabled={!!processingUsers[user.id + "ADMIN"]}
              >
                {processingUsers[user.id + "ADMIN"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : user.role === "ADMIN" ? (
                  <>
                    <ShieldX className="mr-1 h-4 w-4" /> Remover Admin
                  </>
                ) : (
                  <>
                    <Shield className="mr-1 h-4 w-4" /> Promover Admin
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminTableLayout>
  );
};

export default AdminRoleManagement;
