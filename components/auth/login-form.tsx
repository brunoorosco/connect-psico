"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "./auth-card"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { login } from "@/actions/auth"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { CredentialsSchema } from "@/schemas/auth"
import { LoaderIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Separator } from "../ui/separator"
import AuthFormMessage from "./auth-form-message"
import SocialLogin from "./social-login"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [showOTPForm, setShowOTP] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const callbackError =
    searchParams.get("error") === "OAuthAccountNotLinked" ? "E-mail em uso com provedor diferente" : undefined
  const form = useForm<z.infer<typeof CredentialsSchema>>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof CredentialsSchema>) => {
    startTransition(async () => {
      try {
        setError("")
        setSuccess("")

        const resp = await login(values) // só valida

        if (resp?.error) {
          setError(resp.error)
          return
        }

        if (resp?.data?.twoFactorAuthEnabled) {
          setShowOTP(true)
          return
        }

        if (resp?.success) {
          // credenciais validadas, agora loga de verdade
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false, // não redireciona automático
            callbackUrl: "/app",
          })

          if (result?.error) {
            setError("Credenciais inválidas")
            return
          }

          if (result?.url) {
            router.push(result.url)
          }
        }
      } catch (err) {
        setError("Algo deu errado")
        setSuccess("")
        form.reset()
      }
    })
  }

  return (
    <AuthCard title="Conecte-se" description="Seja bem-vindo novamente">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {!showOTPForm && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="voce@provedor.com.br"
                          required
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription className="hidden">Seu e-mail.</FormDescription>
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
                        <div>
                          <Input type="password" placeholder="******" required {...field} disabled={isPending} />
                          <div className="flex items-center">
                            <Link
                              href="/auth/reset-password"
                              className="ml-auto inline-block text-sm text-secondary-foreground underline"
                            >
                              Esqueceu a senha?
                            </Link>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="hidden">Seu e-mail.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {callbackError && <AuthFormMessage type="error" message={callbackError} title="Erro" />}
                {error && <AuthFormMessage type="error" message={error} title="Erro" />}
                {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}
                <Button variant={"default"} className="w-full" disabled={isPending}>
                  <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
                  <span>Conectar</span>
                </Button>
              </div>
            )}
            {showOTPForm && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>Favor entrar com o código enviado por e-mail</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <AuthFormMessage type="error" message={error} title="Erro" />}
                <Button variant={"default"} className="w-full" disabled={isPending}>
                  <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
                  <span>Validar</span>
                </Button>
              </div>
            )}
          </form>
        </Form>

        <Separator />
        <SocialLogin />

        {!showOTPForm && (
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/auth/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        )}
        {showOTPForm && (
          <div className="mt-4 text-center text-sm">
            Conectar agora?{" "}
            <Link href="/auth/login" className="underline">
              Conectar
            </Link>
          </div>
        )}
      </div>
    </AuthCard>
  )
}
