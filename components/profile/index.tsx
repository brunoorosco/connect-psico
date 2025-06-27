"use client";
import React, { startTransition, use, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  defaultProfileValues,
  ProfileFormValues,
  profileSchema,
} from "@/schemas/PsicologoProfileSchema";
import { PersonalInfoForm } from "@/components/profile/InfoPersonal";
import { ProfessionalInfoForm } from "@/components/profile/InfoProfessional";
import { TargetAudienceForm } from "@/components/profile/TargetAudienceForm";
import { AppointmentDetailsForm } from "@/components/profile/AppointmentDetails";
import { useSession } from "next-auth/react";
import { useGetProfessionalById } from "@/hooks/useProfissionals";
import { updateProfessionalProfile } from "@/actions/users/udpateProfileProfessional";
import { useParams } from "next/navigation";

const ProfileProfessionalForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
  });
  const params = useParams();
  const id = params.id as string;
  const { data: session, update } = useSession();
  const { user, loading, error } = useGetProfessionalById(id);

  async function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      try {
        if (!session?.user?.id) {
          toast.error("Usuário não autenticado.");
          return;
        }
        const payload = {
          ...data,
          isProfileCompleted: true,
        };

        const result = await updateProfessionalProfile(session.user.id, payload);

        toast.success(result.success!, {
          description: "Suas informações foram salvas.",
        });
      } catch (error) {
        toast.error("Erro ao atualizar perfil.");
        console.error(error);
      }
    });
    ("use server");
    await update({
      ...session!.user,
      name: data.name,
      email: data.email,
      phone: data.phone,
      image: data.profilePhoto,
      isProfileCompleted: true,
    });
   // window.location.href = `/app/professional/${session?.user.id}/profile`;
  }
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.image,
        bio: user.bio,
        numConselho: user.numConselho,
        ufConselho: user.ufConselho,
        education: user.education,
        experiencia: Number(user.experiencia) || 0,
        especialidade: user.especialidade || [],
        valorAtendimento: Number(user.valorAtendimento) || 0,
        tempoConsulta: user.tempoConsulta,
        publicoAlvo: user.publicoAlvo || [],
        professionalId: user.id,
        tipoAtendimento: user.tipoAtendimento,
      });
    }
  }, [user, form]);

  return (
    <div className="lg:container mx-auto py-6 max-w-5xl">
      {/* <h1 className="text-3xl font-bold mb-6 text-therapy-tertiary">Perfil Profissional</h1> */}
      <p className="text-muted-foreground mb-4">
        Preencha seu perfil profissional para que seus pacientes possam conhecer melhor seu trabalho
        e especialidades.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <PersonalInfoForm profile={user} />
          <ProfessionalInfoForm profile={user} />
          <TargetAudienceForm profile={user} />
          <AppointmentDetailsForm profile={user} />

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Cancelar
            </Button>
            <Button disabled={isPending} className="bg-therapy-primary hover:bg-therapy-tertiary">
              Salvar perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default ProfileProfessionalForm;
