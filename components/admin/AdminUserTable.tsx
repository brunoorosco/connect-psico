import { useState, useEffect, startTransition } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Loader2, Ban, Shield, Check } from "lucide-react";
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
import { getAllUsers } from "@/actions/users";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  is_blocked: boolean;
  roles: string[];
}

const AdminUserTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      startTransition(async () => {
        const data = await getAllUsers();

        if ("error" in data) {
          setError(data.error); // Se for um erro, salva no estado de erro
        } else if (data) {
          setUsers(data);
          console.log(data[0]);
        }
      });
      // Commented out actual implementation until database is set up
      /*
      // Get users from auth.users
      const { data: authUsers, error: authError } = await supabase
        .rpc("get_all_users");

      if (authError) throw authError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles = authUsers.map((user: any) => {
        const userRolesArray = userRoles
          .filter((role: any) => role.user_id === user.id)
          .map((role: any) => role.role);
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          is_blocked: user.is_blocked || false,
          roles: userRolesArray
        };
      });

      setUsers(usersWithRoles);
      */
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBlock = async (userId: string, currentBlockStatus: boolean) => {
    setProcessingUsers((prev) => ({ ...prev, [userId]: true }));

    try {
      // Mock toggle action for now
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_blocked: !currentBlockStatus } : user
        )
      );

      toast({
        title: "Usuário atualizado",
        description: `Usuário ${!currentBlockStatus ? "bloqueado" : "desbloqueado"} com sucesso!`,
      });

      // Commented out actual implementation until database is set up
      /*
      const { error } = await supabase.rpc("toggle_user_block_status", {
        target_user_id: userId,
        block_status: !currentBlockStatus
      });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_blocked: !currentBlockStatus } 
          : user
      ));

      toast({
        title: "Usuário atualizado",
        description: `Usuário ${!currentBlockStatus ? "bloqueado" : "desbloqueado"} com sucesso!`,
      });
      */
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Filter users based on search query

  const filteredUsers =
    users.length > 0 &&
    users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Usuários</h2>
        <div className="w-1/3">
          <Input
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers ? (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {/* {user.roles.map((role: any) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "destructive" : "secondary"}
                          >
                            {role === "admin"
                              ? "Admin"
                              : role === "supervisor"
                              ? "Supervisor"
                              : "Usuário"}
                          </Badge>
                        ))} */}
                        {/* {user.roles.length === 0 && <Badge variant="outline">Usuário</Badge>} */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_blocked ? "destructive" : "default"}>
                        {user.is_blocked ? "Bloqueado" : "Ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={user.is_blocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                        disabled={processingUsers[user.id]}
                      >
                        {processingUsers[user.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.is_blocked ? (
                          <>
                            <Check className="mr-1 h-4 w-4" /> Desbloquear
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" /> Bloquear
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;
