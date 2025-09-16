import React, { startTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { completeOnboarding } from "@/actions/onboarding/updateProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OnboardingCompleteProps {
  isProfessional: boolean;
  isLoading: boolean;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ isProfessional, isLoading }) => {
  const { update, data: session } = useSession();
  const router = useRouter();

  const handleContinue = async () => {
    try {
      startTransition(async () => {
        if (!session?.user?.id) {
          toast.error("Usuário não autenticado.");
          return;
        }
        await completeOnboarding({
          id: session.user.id,
          isProfessional: false,
        });
      });

      ("use server");
      await update({
        ...session!.user,
        isNewProfile: false,
      });
    } catch (error) {
      console.error("Erro ao atualizar sessão", error);
    }

    window.location.href = "/app";
  };

  if (isLoading) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h3 className="text-lg font-semibold">Processando seus dados...</h3>
        <p className="text-sm text-muted-foreground">Aguarde enquanto configuramos sua conta.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />

      <div>
        <h3 className="text-lg font-semibold mb-2">Parabéns!</h3>
        <p className="text-sm text-muted-foreground">
          {isProfessional
            ? "Seu perfil profissional foi configurado com sucesso. Você já pode começar a gerenciar seus atendimentos."
            : "Seu perfil foi configurado com sucesso. Você já pode agendar consultas e gerenciar seus atendimentos."}
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full">
        Ir para o Sistema
      </Button>
    </div>
  );
};

export default OnboardingComplete;

