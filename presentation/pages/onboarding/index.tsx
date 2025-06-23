"use client";
import React, { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import ProfessionalCheck from "@/components/onboarding/ProfessionalCheck";
import ProfessionalInfo from "@/components/onboarding/ProfessionalInfo";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";
import { useParams, useRouter } from "next/navigation";
import { updateProvider } from "@/actions/onboarding/updateProvider";

export interface OnboardingData {
  isProfessional: boolean;
  professionalRegistration?: string;
  state?: string;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    isProfessional: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const params = useParams();
  const id = params.id as string;

  const totalSteps = onboardingData.isProfessional ? 3 : 2;
  const progress = (currentStep / totalSteps) * 100;
  const router = useRouter();
  const handleProfessionalCheck = (isProfessional: boolean) => {
    setOnboardingData((prev) => ({ ...prev, isProfessional }));
    setCurrentStep(2);
  };

  const handleProfessionalInfo = (data: { numberConselho: string; ufConselho: string }) => {
    const professionalData = {
      professionalRegistration: data.numberConselho,
      state: data.ufConselho,
    };
  
    const updatedData = { ...onboardingData, ...professionalData };
  
    setOnboardingData(updatedData);
    setCurrentStep(3);
    submitOnboardingData(updatedData);
  };

  const handleNonProfessionalComplete = () => {
    setCurrentStep(2);
    submitOnboardingData(onboardingData);
  };

  const submitOnboardingData = async (data: OnboardingData) => {
    setIsLoading(true);
    try {
      console.log("Dados enviados para API:", { userId: id, ...data });
      startTransition(async () => {
        try {
          const { success, error } = await updateProvider({ userId: id, ...data });
          if (error) setError(error);
          setSuccess(success || "");
        } catch (error) {
          setError("Algo deu errado.");
        }
      });

      router.push("/app");
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfessionalCheck onNext={handleProfessionalCheck} />;
      case 2:
        if (onboardingData.isProfessional) {
          return <ProfessionalInfo onNext={handleProfessionalInfo} isLoading={isLoading} />;
        } else {
          return <OnboardingComplete isProfessional={false} isLoading={isLoading} />;
        }
      case 3:
        return <OnboardingComplete isProfessional={true} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <CardTitle>Bem-vindo!</CardTitle>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Etapa {currentStep} de {totalSteps}
            </p>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
