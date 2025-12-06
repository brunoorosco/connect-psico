"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Check, X, Eye, EyeOff, Info, Shield, LoaderIcon, CheckCircle2, AlertCircle } from "lucide-react"
import AuthFormMessage from "@/components/auth/auth-form-message"
import { changePassword } from "@/actions/auth/changePassword"

// Schema de validação
const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Senha atual é obrigatória" }),
    newPassword: z
      .string()
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
      .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula" })
      .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula" })
      .regex(/[0-9]/, { message: "Deve conter pelo menos um número" }),
    confirmPassword: z.string().min(1, { message: "Confirme sua nova senha" }),
    twoFactorEnabled: z.boolean().default(false),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "A nova senha não pode ser igual à atual",
    path: ["newPassword"],
  })

type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorEnabled: false,
    },
    mode: "onChange",
  })

  const watchNewPassword = form.watch("newPassword")
  const watchConfirmPassword = form.watch("confirmPassword")

  // Validações em tempo real
  const passwordValidation = {
    hasMinLength: watchNewPassword.length >= 6,
    hasUppercase: /[A-Z]/.test(watchNewPassword),
    hasLowercase: /[a-z]/.test(watchNewPassword),
    hasNumber: /[0-9]/.test(watchNewPassword),
  }

  const passwordsMatch = watchNewPassword === watchConfirmPassword && watchConfirmPassword.length > 0

  const onSubmit = (values: ChangePasswordFormValues) => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const result = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          twoFactorEnabled: values.twoFactorEnabled,
        })

        if (result?.error) {
          setError(result.error)
          return
        }

        setSuccess("Senha alterada com sucesso!")
        form.reset()

        setTimeout(() => {
          router.back()
        }, 2000)
      } catch {
        setError("Algo deu errado. Tente novamente.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6" disabled={isPending}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança da Conta
            </CardTitle>
            <CardDescription>Altere sua senha e configure a autenticação em duas etapas</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Senha Atual */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Digite sua senha atual"
                            disabled={isPending}
                            className="pr-10"
                          />
                          <PasswordToggleButton
                            show={showCurrentPassword}
                            onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nova Senha */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Digite sua nova senha"
                            disabled={isPending}
                            className="pr-10"
                          />
                          <PasswordToggleButton
                            show={showNewPassword}
                            onToggle={() => setShowNewPassword(!showNewPassword)}
                            disabled={isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Requisitos da senha */}
                      {watchNewPassword.length > 0 && <PasswordRequirements validation={passwordValidation} />}
                    </FormItem>
                  )}
                />

                {/* Confirmar Nova Senha */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua nova senha"
                            disabled={isPending}
                            className="pr-10"
                          />
                          <PasswordToggleButton
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Feedback de confirmação */}
                      {watchConfirmPassword.length > 0 && <PasswordMatchFeedback match={passwordsMatch} />}
                    </FormItem>
                  )}
                />

                {/* Separador - 2FA */}
                <div className="border-t pt-6">
                  <FormField
                    control={form.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FormLabel className="cursor-pointer">Autenticação em Duas Etapas (2FA)</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  Ao ativar, todo login será verificado com um código enviado para seu e-mail
                                  cadastrado, aumentando a segurança da sua conta.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("twoFactorEnabled") && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Um código será enviado ao seu e-mail a cada novo login.
                    </p>
                  )}
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && <AuthFormMessage type="error" message={error} title="Erro" />}
                {success && <AuthFormMessage type="success" message={success} title="Sucesso" />}

                {/* Botão de Salvar */}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <LoaderIcon className="animate-spin mr-2 h-4 w-4" />}
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Subcomponentes
// ============================================

interface PasswordToggleButtonProps {
  show: boolean
  onToggle: () => void
  disabled?: boolean
}

function PasswordToggleButton({ show, onToggle, disabled }: PasswordToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
      onClick={onToggle}
      disabled={disabled}
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
      <span className="sr-only">{show ? "Ocultar senha" : "Mostrar senha"}</span>
    </Button>
  )
}

interface PasswordValidation {
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

interface PasswordRequirementsProps {
  validation: PasswordValidation
}

function PasswordRequirements({ validation }: PasswordRequirementsProps) {
  const requirements = [
    { key: "hasMinLength", label: "Mínimo de 6 caracteres" },
    { key: "hasUppercase", label: "Pelo menos uma letra maiúscula" },
    { key: "hasLowercase", label: "Pelo menos uma letra minúscula" },
    { key: "hasNumber", label: "Pelo menos um número" },
  ] as const

  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">A senha deve conter:</p>
      {requirements.map(({ key, label }) => {
        const isValid = validation[key]
        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={isValid ? "text-green-600" : "text-muted-foreground"}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

interface PasswordMatchFeedbackProps {
  match: boolean
}

function PasswordMatchFeedback({ match }: PasswordMatchFeedbackProps) {
  return (
    <p className={`text-sm flex items-center gap-1 mt-2 ${match ? "text-green-600" : "text-destructive"}`}>
      {match ? (
        <>
          <Check className="h-4 w-4" />
          As senhas coincidem
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          As senhas não coincidem
        </>
      )}
    </p>
  )
}
