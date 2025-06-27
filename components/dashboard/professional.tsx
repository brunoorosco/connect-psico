'use client'
import PsychologistDashboard from "@/components/dashboard/ProfissionalDashboard";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();
  const alert = session?.user.role === "SUPERVISOR" && !session?.user.isProfileCompleted;

  return (
    <div className="min-h-screen">
      {alert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Necessário terminar seu cadastro de profissional.{" "}
                <a className="font-semibold" href={`/app/professional/${session?.user.id}/profile`}>
                  Clique Aqui!
                </a>
                {"  "}Após a atualização é necessário relogar pra que as alterações sejam refletidas{" "}
                {/* <a className="font-semibold" href={`/auth/logout`}>
                  Clique p/ Sair!
                </a> */}
              </p>
            </div>
          </div>
        </div>
      )}
      <PsychologistDashboard />
    </div>
  );
};

export default Dashboard;
