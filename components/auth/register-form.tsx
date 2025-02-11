"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Switch } from "@/components/ui/switch";

import { register } from "@/actions/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegisterSchema } from "@/schemas/auth";
import AuthCard from "./auth-card";
import AuthFormMessage from "./auth-form-message";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isProfessional, setIsProfessional] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      crp: "",
      especialidade: "",
      professional: isProfessional,
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      try {
        values.professional = isProfessional;
        const { success, error } = await register(values);
        if (error) setError(error);
        setSuccess(success || "");
        form.reset();
      } catch (error) {
        setSuccess("");
        setError("Algo deu errado.");
        form.reset();
      }
    });
  };

  return (
    <AuthCard title='Registre-se' description='Seja bem-vindo'>
      <div className='space-y-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-3'>
              <FormField
                control={form.control}
                name='professional'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center rounded-lg p-3 shadow-sm'>
                    <FormControl>
                      <Switch
                        checked={isProfessional}
                        onCheckedChange={setIsProfessional}
                      />
                    </FormControl>
                    <FormLabel className='h-5 ml-2'>
                      Registro Profissonal
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete='off'
                        type='name'
                        placeholder='Jose da Silva'
                        required
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='voce@provedor.com.br'
                        required
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone/WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        type='type'
                        placeholder='(00) 0000-00000'
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='******'
                        required
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isProfessional && (
                <>
                  <FormField
                    control={form.control}
                    name='crp'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='123456-UF'
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {error && (
                <AuthFormMessage type='error' message={error} title='Erro' />
              )}
              {success && (
                <AuthFormMessage
                  type='success'
                  message={success}
                  title='Sucesso'
                />
              )}
              <Button
                variant={"default"}
                className='w-full'
                disabled={isPending}
              >
                <LoaderIcon
                  className={!isPending ? "hidden" : "animate-spin mr-2"}
                />
                <span>Registrar</span>
              </Button>
            </div>
          </form>
        </Form>

        <div className='mt-4 text-center text-sm'>
          Já tem uma conta?{" "}
          <Link href='/auth/login' className='underline'>
            Efetue Login
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
