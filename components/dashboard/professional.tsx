"use server";
import PsychologistDashboard from "@/components/dashboard/ProfissionalDashboard";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/auth";

const Dashboard = async () => {
  const session = await auth();
  const alert = session?.user.role === "SUPERVISOR" && !session?.user.isProfileCompleted;

  return (
    <div className="min-h-screen">
      {alert && (
        <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 font-medium">
            Necessário terminar seu cadastro de profissional.{" "}
            <a className="font-semibold" href={`/app/professional/${session?.user.id}/profile`}>
              Clique Aqui!
            </a>
          </AlertTitle>
        </Alert>
      )}
      <PsychologistDashboard />
    </div>
  );
};

export default Dashboard;
