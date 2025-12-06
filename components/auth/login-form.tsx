"use client"

import Link from "next/link"
import { useState, useTransition, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { login, resendOtpCode } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { CredentialsSchema } from "@/schemas/auth"
import { LoaderIcon, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react"

import AuthCard from "./auth-card"
import AuthFormMessage from "./auth-form-message"
import SocialLogin from "./social-login"

// Tempo para reenvio do código (em segundos)
const RESEND_COOLDOWN = 60

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showOTPForm, setShowOTP] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const callbackError =
    searchParams.get("error") === "OAuthAccountNotLinked" ? "E-mail em uso com provedor diferente" : undefined

  const form = useForm<z.infer<typeof CredentialsSchema>>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  })

  const watchedEmail = form.watch("email")

  // Timer para reenvio de código
  useEffect(() => {
    if (resendTimer <= 0) return

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [resendTimer])

  // Inicia o timer quando mostrar OTP
  useEffect(() => {
    if (showOTPForm) {
      setResendTimer(RESEND_COOLDOWN)
    }
  }, [showOTPForm])

  const handleResendCode = useCallback(async () => {
    if (resendTimer > 0 || isResending) return

    setIsResending(true)
    setError("")

    try {
      const result = await resendOtpCode(watchedEmail)

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess("Novo código enviado para seu e-mail")
        setResendTimer(RESEND_COOLDOWN)
        // Limpa a mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch {
      setError("Erro ao reenviar código")
    } finally {
      setIsResending(false)
    }
  }, [resendTimer, isResending, watchedEmail])

  const handleBackToLogin = () => {
    setShowOTP(false)
    setError("")
    setSuccess("")
    form.setValue("code", "")
  }

  const onSubmit = async (values: z.infer<typeof CredentialsSchema>) => {
    startTransition(async () => {
      try {
        setError("")
        setSuccess("")

        const resp = await login(values)

        if (resp?.error) {
          setError(resp.error)
          return
        }

        if (resp?.data?.twoFactorAuthEnabled) {
          setShowOTP(true)
          return
        }

        if (resp?.success) {
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            code: values.code,
            redirect: false,
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
      } catch {
        setError("Algo deu errado. Tente novamente.")
        form.resetField("password")
        form.resetField("code")
      }
    })
  }

  return (
    <AuthCard
      title={showOTPForm ? "Verificação em duas etapas" : "Conecte-se"}
      description={showOTPForm ? "Digite o código enviado para seu e-mail" : "Seja bem-vindo novamente"}
    >
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {!showOTPForm ? (
              <LoginFields
                form={form}
                isPending={isPending}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                error={error}
                success={success}
                callbackError={callbackError}
              />
            ) : (
              <OTPFields
                form={form}
                isPending={isPending}
                isResending={isResending}
                error={error}
                success={success}
                resendTimer={resendTimer}
                onResendCode={handleResendCode}
                onBack={handleBackToLogin}
              />
            )}
          </form>
        </Form>

        {!showOTPForm && (
          <>
            <Separator />
            <SocialLogin />
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/auth/signup" className="underline font-medium">
                Cadastre-se
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  )
}

// ============================================
// Subcomponentes
// ============================================

interface LoginFieldsProps {
  form: ReturnType<typeof useForm<z.infer<typeof CredentialsSchema>>>
  isPending: boolean
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  error: string
  success: string
  callbackError?: string
}

function LoginFields({
  form,
  isPending,
  showPassword,
  setShowPassword,
  error,
  success,
  callbackError,
}: LoginFieldsProps) {
  return (
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
                autoComplete="email"
                disabled={isPending}
                {...field}
              />
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
            <div className="flex items-center justify-between">
              <FormLabel>Senha</FormLabel>
              <Link
                href="/auth/reset-password"
                className="text-sm text-muted-foreground hover:text-primary underline"
                tabIndex={-1}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  disabled={isPending}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {callbackError && <AuthFormMessage type="error" message={callbackError} title="Erro" />}
      {error && <AuthFormMessage type="error" message={error} title="Erro" />}
      {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}

      <Button variant="default" className="w-full" disabled={isPending}>
        {isPending && <LoaderIcon className="animate-spin mr-2 h-4 w-4" />}
        Conectar
      </Button>
    </div>
  )
}

interface OTPFieldsProps {
  form: ReturnType<typeof useForm<z.infer<typeof CredentialsSchema>>>
  isPending: boolean
  isResending: boolean
  error: string
  success: string
  resendTimer: number
  onResendCode: () => void
  onBack: () => void
}

function OTPFields({
  form,
  isPending,
  isResending,
  error,
  success,
  resendTimer,
  onResendCode,
  onBack,
}: OTPFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de verificação</FormLabel>
            <FormControl>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  disabled={isPending}
                  value={field.value}
                  onChange={(value) => {
                    // Remove qualquer caractere que não seja número
                    const cleanValue = value.replace(/\D/g, "")
                    field.onChange(cleanValue)
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pastedData = e.clipboardData.getData("text")
                    // Pega apenas os 6 primeiros dígitos
                    const cleanValue = pastedData.replace(/\D/g, "").slice(0, 6)
                    field.onChange(cleanValue)
                  }}
                >
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
              </div>
            </FormControl>
            <FormDescription className="text-center">
              Digite o código de 6 dígitos enviado para seu e-mail
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {error && <AuthFormMessage type="error" message={error} title="Erro" />}
      {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}

      <Button variant="default" className="w-full" disabled={isPending}>
        {isPending && <LoaderIcon className="animate-spin mr-2 h-4 w-4" />}
        Verificar
      </Button>

      {/* Botão de reenviar código */}
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          disabled={resendTimer > 0 || isResending}
          onClick={onResendCode}
        >
          {isResending ? (
            <>
              <LoaderIcon className="animate-spin mr-2 h-3 w-3" />
              Enviando...
            </>
          ) : resendTimer > 0 ? (
            `Reenviar código em ${resendTimer}s`
          ) : (
            <>
              <RefreshCw className="mr-2 h-3 w-3" />
              Reenviar código
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Botão de voltar */}
      <Button type="button" variant="outline" className="w-full" onClick={onBack} disabled={isPending}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para login
      </Button>
    </div>
  )
}
