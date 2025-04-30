import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { defaultProfileValues, ProfileFormValues, profileSchema } from "@/schemas/PsicologoProfileSchema";
import { PersonalInfoForm } from "@/components/profile/InfoPersonal";
import { ProfessionalInfoForm } from "@/components/profile/InfoProfessional";
import { TargetAudienceForm } from "@/components/profile/TargetAudienceForm";
import { AppointmentDetailsForm } from "@/components/profile/AppointmentDetails";


const PsychologistProfile: React.FC = () => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    
    toast.success("Perfil atualizado com sucesso!", {
      description: "Suas informações foram salvas.",
    });
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-therapy-tertiary">Perfil Profissional</h1>
      <p className="text-muted-foreground mb-8">
        Preencha seu perfil profissional para que seus pacientes possam conhecer melhor seu trabalho e especialidades.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <PersonalInfoForm />
          <ProfessionalInfoForm />
          <TargetAudienceForm />
          <AppointmentDetailsForm />

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-therapy-primary hover:bg-therapy-tertiary"
            >
              Salvar perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PsychologistProfile;