'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingCompleteProps {
  isProfessional: boolean;
  isLoading: boolean;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ isProfessional, isLoading }) => {
  // const navigate = useNavigate();
const router = useRouter();
  const handleContinue = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h3 className="text-lg font-semibold">Processando seus dados...</h3>
        <p className="text-sm text-muted-foreground">
          Aguarde enquanto configuramos sua conta.
        </p>
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
            ? 'Seu perfil profissional foi configurado com sucesso. Você já pode começar a gerenciar seus atendimentos.'
            : 'Seu perfil foi configurado com sucesso. Você já pode agendar consultas e gerenciar seus atendimentos.'
          }
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full">
        Ir para o Sistema
      </Button>
    </div>
  );
};

export default OnboardingComplete;