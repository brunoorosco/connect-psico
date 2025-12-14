"use client";

import PsychologistDashboard from "@/components/dashboard/ProfissionalDashboard";
import { AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useProductTour } from "@/hooks/useProductTour";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startTour, hasSeenTour } = useProductTour();

  const mustCompleteProfile =
    session?.user.role === "SUPERVISOR" &&
    !session?.user.isProfileCompleted;

  useEffect(() => {
    if (mustCompleteProfile) {
      router.push(`/app/professional/${session?.user?.id}/profile`);
    }
  }, [mustCompleteProfile, router, session?.user?.id]);

  // Iniciar tour automaticamente após onboarding
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user.isProfileCompleted &&
      !hasSeenTour &&
      !mustCompleteProfile
    ) {
      // Delay para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        startTour("dashboard");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, session?.user.isProfileCompleted, hasSeenTour, mustCompleteProfile, startTour]);

  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen">
      {mustCompleteProfile && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Necessário terminar seu cadastro de profissional.{" "}
                <Link
                  className="font-semibold underline"
                  href={`/app/professional/${session?.user?.id}/profile`}
                >
                  Clique aqui!
                </Link>{" "}
                Após a atualização é necessário relogar.
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
