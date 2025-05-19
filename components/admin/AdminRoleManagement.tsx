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

type Props = {
  professionals: ProfessionalModel[];
};

const AdminRoleManagement = ({ professionals }: Props) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [processingUsers, setProcessingUsers] = useState<Record<string, string>>({});

  const updateUserRole = async (
    userId: string,
    role: "ADMIN" | "SUPERVISOR",
    shouldHaveRole: boolean
  ) => {
    // Set the processing state for this user and role
    setProcessingUsers((prev) => ({ ...prev, [userId + role]: role }));
    console.log(processingUsers);
    console.log(userId, role);
    try {
      // Mock update action for now
      setUsers(
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

  // Filter users based on search query
  const filteredUsers = professionals?.filter((user: ProfessionalModel) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Permissões</h2>
        <div className="w-1/3">
          <Input
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {!filteredUsers ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Permissões Atuais</TableHead>
                <TableHead>Gerenciar Supervisor</TableHead>
                <TableHead>Gerenciar Administrador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user: ProfessionalModel) => (
                  <TableRow key={user.id}>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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

export default AdminRoleManagement;
