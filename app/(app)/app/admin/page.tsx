"use client";
import { getAllUsers } from "@/actions/users";
import AdminPanel from "@/components/admin/PainelAdmin";
import { useToast } from "@/components/ui/use-toast";
import { startTransition, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const DashboardPageAdmin = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const fetchUsers = async () => {
  //   try {
  //     startTransition(async () => {
  //       const data = await getAllUsers({limit:10, page:1});
  //       if ("error" in data) {
  //         setError(data.error); // Se for um erro, salva no estado de erro
  //       } else if (data) {
  //         setUsers(data);
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     toast({
  //       title: "Erro",
  //       description: "Não foi possível carregar a lista de usuários",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex flex-col">
  //       <div className="flex-1 flex items-center justify-center">
  //         <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      <AdminPanel />
    </div>
  );
};

export default DashboardPageAdmin;
