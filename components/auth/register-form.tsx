"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Switch } from "@/components/ui/switch"
import InputMask from "react-input-mask"
import { register } from "@/actions/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RegisterSchema } from "@/schemas/auth"
import AuthCard from "./auth-card"
import AuthFormMessage from "./auth-form-message"
import SocialLogin from "./social-login"
import { ufCRP } from "@/utils/ufCRP"

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      numConselho: "",
      ufConselho: "",
      especialidade: "",
      professional: false,
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      try {
        const { success, error } = await register(values)
        if (error) setError(error)
        setSuccess(success || "")
        form.reset()
      } catch (error) {
        setSuccess("")
        setError("Algo deu errado.")
        form.reset()
      }
    })
  }

  return (
    <AuthCard title="Registra-se" description="Seja bem-vindo">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="professional"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center rounded-lg p-3 shadow-sm">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => form.setValue("professional", checked)}
                      />
                    </FormControl>
                    <FormLabel className="h-5 ml-2">Registro Profissional</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        type="name"
                        placeholder="Jose da Silva"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="voce@provedor.com.br" required {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone/WhatsApp</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            type="tel"
                            placeholder="(00) 00000-0000"
                            required
                            name={field.name}
                            ref={field.ref}
                          />
                        )}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" required {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("professional") && (
                <div className="flex gap-2">
                  <div className="w-2/3">
                    <FormField
                      control={form.control}
                      name="ufConselho"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isPending}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none"
                            >
                              <option value="">Selecione a UF</option>
                              {ufCRP.map((uf) => (
                                <option key={uf} value={uf}>
                                  CRP - {uf}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="numConselho"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº de Registro</FormLabel>
                          <FormControl>
                            <Input placeholder="123412" {...field} disabled={isPending} maxLength={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              {error && <AuthFormMessage type="error" message={error} title="Erro" />}
              {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}
              <Button variant={"default"} className="w-full" disabled={isPending}>
                <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
                <span>Registrar</span>
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <SocialLogin />
        </div>
        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="underline">
            Efetue Login
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
