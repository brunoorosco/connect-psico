"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type * as z from "zod"

import { changePassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NewPasswordSchema } from "@/schemas/auth"
import { LoaderIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import AuthCard from "./auth-card"
import AuthFormMessage from "./auth-form-message"

export const ChangePasswordForm = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [isCompleted, setIsCompleted] = useState(false) // Novo estado
  const router = useRouter() // Hook para redirecionamento

  const searchParam = useSearchParams()
  if (!searchParam || searchParam.get("token") === null) {
    console.error(searchParam?.get("token"))
    throw new Error("Token não encontrado")
  }
  const token = searchParam.get("token")

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const { success, error } = await changePassword(values, token)
        if (error) {
          setError(error)
          return
        }

        setSuccess(success || "Senha alterada com sucesso! Redirecionando...")
        setIsCompleted(true) // Bloqueia o formulário
        form.reset()

        // Redireciona após 2 segundos
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } catch (err) {
        setSuccess("")
        setError("Algo deu errado.")
        form.reset()
      }
    })
  }

  // Determina se o formulário deve estar desabilitado
  const isDisabled = isPending || isCompleted

  return (
    <AuthCard title="Modifique sua senha" description="Escolha uma nova senha">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isDisabled} placeholder="******" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {error && <AuthFormMessage type="error" message={error} title="Erro" />}
          {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}

          <Button variant="default" className="w-full" disabled={isDisabled}>
            <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
            <span>{isCompleted ? "Redirecionando..." : "Mudar senha"}</span>
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Gostaria de conectar-se?{" "}
        <Link href="/auth/login" className="underline">
          Conectar agora
        </Link>
      </div>
    </AuthCard>
  )
}
