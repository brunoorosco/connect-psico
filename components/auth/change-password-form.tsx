"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import type * as z from "zod"

import { changePassword, validateResetToken } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NewPasswordSchema } from "@/schemas/auth"
import { LoaderIcon, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import AuthCard from "./auth-card"
import AuthFormMessage from "./auth-form-message"

type TokenStatus = "loading" | "valid" | "invalid" | "expired" | "used"

export const ChangePasswordForm = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [isCompleted, setIsCompleted] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading")
  const [tokenError, setTokenError] = useState<string>("")
  const router = useRouter()

  const searchParam = useSearchParams()
  const token = searchParam?.get("token")

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  // Verifica o token ao carregar a página
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenStatus("invalid")
        setTokenError("Token não encontrado na URL")
        return
      }

      const result = await validateResetToken(token)

      if (result.valid) {
        setTokenStatus("valid")
      } else {
        setTokenStatus("invalid")
        setTokenError(result.error || "Token inválido")
      }
    }

    checkToken()
  }, [token])

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
        setIsCompleted(true)
        form.reset()

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

  const isDisabled = isPending || isCompleted

  // Loading state
  if (tokenStatus === "loading") {
    return (
      <AuthCard title="Verificando..." description="Aguarde enquanto validamos seu link">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validando token de segurança...</p>
        </div>
      </AuthCard>
    )
  }

  // Token inválido ou expirado
  if (tokenStatus === "invalid") {
    return (
      <AuthCard title="Link Inválido" description="Não foi possível validar seu link">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{tokenError}</p>
            <p className="text-xs text-muted-foreground">O link pode ter expirado ou já foi utilizado.</p>
          </div>
          <div className="flex flex-col gap-2 w-full pt-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/auth/reset-password">Solicitar novo link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Voltar para login</Link>
            </Button>
          </div>
        </div>
      </AuthCard>
    )
  }

  // Formulário de alteração de senha (token válido)
  return (
    <AuthCard title="Modifique sua senha" description="Escolha uma nova senha segura">
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
                    <Input {...field} disabled={isDisabled} placeholder="Digite sua nova senha" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Indicador de requisitos da senha */}
            <PasswordRequirements password={form.watch("password")} />
          </div>

          {error && <AuthFormMessage type="error" message={error} title="Erro" />}
          {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}

          <Button variant="default" className="w-full" disabled={isDisabled}>
            {isPending && <LoaderIcon className="animate-spin mr-2 h-4 w-4" />}
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

// Componente para mostrar os requisitos da senha
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Um número", valid: /[0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-3">
      <p className="text-xs font-medium text-muted-foreground">Requisitos da senha:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {req.valid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={req.valid ? "text-green-600" : "text-muted-foreground"}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
