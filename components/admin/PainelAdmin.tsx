import { useState, useEffect, startTransition } from "react";
import { Check, Shield, Ban, User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserTable from "@/components/admin/AdminUserTable";
import AdminRoleManagement from "@/components/admin/AdminRoleManagement";
import { useRouter } from "next/navigation";

const AdminPanel = () => {
  const navigate = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminPermission = async () => {
      try {
        //const { data: sessionData } = await supabase.auth.getSession()

        // Skip authentication check for now, just allow access
        setIsAdmin(true);
        setLoading(false);

        // Commented out actual implementation until database is set up
        /*
        if (!sessionData.session) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar esta página",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Check if user has admin role
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sessionData.session.user.id)
          .eq("role", "admin");

        if (error) throw error;

        // Only allow access if user has admin role
        if (!data || data.length === 0) {
          toast({
            title: "Acesso restrito",
            description: "Você não tem permissão para acessar o painel de administração",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
        setLoading(false);
        */
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar suas permissões",
          variant: "destructive",
        });
        // Allow access anyway for now
        setIsAdmin(true);
        setLoading(false);
      }
    };

    checkAdminPermission();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // User will be redirected in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="roles">Gerenciar Permissões</TabsTrigger>
            <TabsTrigger value="payments">Status de Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <AdminUserTable />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <AdminRoleManagement />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Status de Pagamentos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie o status de pagamento dos usuários.
            </p>
            <div className="mt-4">
              {/* Payment status management will be implemented here */}
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
