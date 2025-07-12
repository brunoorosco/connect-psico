import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProfessionalModel } from "@/domain/model/professional";
import { useUserPagination } from "@hooks/useUserPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import PaginationControls from "@components/PaginationControls";

const AdminRoleManagement = () => {
  const { toast } = useToast();
  const {
    users,
    search,
    setSearch,
    order,
    setOrder,
    page,
    setPage,
    totalPages,
    loading,
    orderBy,
    limit,
    setOrderBy,
    setLimit,
  } = useUserPagination();

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  const [processingUsers, setProcessingUsers] = useState<Record<string, string>>({});
const [usersUpdated, setUsersUpdated] = useState<ProfessionalModel[]>([]);

  const updateUserRole = async (
    userId: string,
    role: "ADMIN" | "SUPERVISOR",
    shouldHaveRole: boolean
  ) => {
    // Set the processing state for this user and role
    setProcessingUsers((prev) => ({ ...prev, [userId + role]: role }));
    try {
      // Mock update action for now
      setUsersUpdated((prev) =>
        users.map((user) => {
          if (user.id === userId) {
            if (role === "ADMIN") {
              return { ...user, is_admin: shouldHaveRole };
            } else {
              // supervisor
              return { ...user, is_supervisor: shouldHaveRole };
            }
          }
          return user;
        })
      );

      toast({
        title: "Permissão atualizada",
        description: `Usuário ${shouldHaveRole ? "promovido a" : "removido de"} ${
          role === "ADMIN" ? "administrador" : "supervisor"
        }!`,
      });

      // Commented out actual implementation until database is set up
      /*
      if (shouldHaveRole) {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role })
          .select();

        if (error && error.code !== "23505") { // Ignore duplicate key errors
          throw error;
        }
      } else {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
      }

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          if (role === "admin") {
            return { ...user, is_admin: shouldHaveRole };
          } else { // supervisor
            return { ...user, is_supervisor: shouldHaveRole };
          }
        }
        return user;
      }));

      toast({
        title: "Permissão atualizada",
        description: `Usuário ${shouldHaveRole ? "promovido a" : "removido de"} ${role === "admin" ? "administrador" : "supervisor"}!`,
      });
      */
    } catch (error) {
      console.error(`Error updating user role to ${role}:`, error);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Permissões</h2>
        <div className="w-1/3">
          <Input
            placeholder="Buscar por nome e email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Itens por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">Nenhum usuário encontrado.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissões Atuais</TableHead>
                <TableHead>Gerenciar Supervisor</TableHead>
                <TableHead>Gerenciar Administrador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.role === "ADMIN" && <Badge variant="destructive">Admin</Badge>}
                        {user.role === "SUPERVISOR" && (
                          <Badge variant="secondary">Supervisor</Badge>
                        )}
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
                        disabled={!!processingUsers[user.id + "supervisor"]}
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
            {totalPages > 1 && (
            <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRoleManagement;
