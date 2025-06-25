"use client";
import React, { useEffect } from "react";
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
import useSWR from "swr";
import { getUserById } from "@/actions/users";
import { UserInfoForm } from "./InfoPersonalDefault";
import { useParams } from "next/navigation";

const UserProfileForm: React.FC = () => {
  const { id } = useParams() as { id: string };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
  });

  const {
    data: user,
    error,
    isLoading,
  } = useSWR(id ? `/user/${id}` : null, () => getUserById(id), {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        profilePhoto: user.image ?? "",
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    toast.success("Perfil atualizado com sucesso!", {
      description: "Suas informações foram salvas.",
    });
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-therapy-tertiary">Perfil</h1>
      <p className="text-muted-foreground mb-8">Preencha seu perfil.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <UserInfoForm profile={user} />
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-therapy-primary hover:bg-therapy-tertiary">
              Salvar perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserProfileForm;
