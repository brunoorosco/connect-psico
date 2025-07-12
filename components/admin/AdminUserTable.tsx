import { useEffect, useState } from "react";
import { Loader2, Ban, Check } from "lucide-react";
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
import { useUserPagination } from "@/hooks/useUserPagination"; // Pega dados do backend
import PaginationControls from "@/components/PaginationControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

const AdminUserTable = () => {
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

  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const toggleUserBlock = async (userId: string, currentBlockStatus: boolean) => {
    setProcessingUsers((prev) => ({ ...prev, [userId]: true }));
    try {
      // Ex: await updateUserStatus(userId, !currentBlockStatus);

      toast({
        title: "Usuário atualizado",
        description: `Usuário ${!currentBlockStatus ? "bloqueado" : "desbloqueado"} com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Usuários</h2>
        <div className="flex gap-2 items-center w-2/3">
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
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => {
                    setOrderBy("name");
                    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    setPage(1);
                  }}
                >
                  Nome {orderBy === "name" && (order === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "destructive"
                          : user.role === "SUPERVISOR"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "SUPERVISOR"
                        ? "Supervisor"
                        : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.active ? "default" : "destructive"}
                      className={user.active ? "bg-green-600" : ""}
                    >
                      {user.active ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={user.active ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => toggleUserBlock(user.id, user.active)}
                      disabled={processingUsers[user.id]}
                    >
                      {processingUsers[user.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.active ? (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Bloquear
                        </>
                      ) : (
                        <>
                          <Ban className="mr-1 h-4 w-4" /> Desbloquear
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

export default AdminUserTable;
