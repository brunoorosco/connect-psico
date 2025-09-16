"use client"
import React, { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react" // v5 client
import { Button } from "@/components/ui/button"

import { Input, Label } from "@components/ui"
import { LogIn } from "lucide-react"

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const search = useSearchParams()
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/"
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const callbackUrl = useMemo(() => {
    // Mantém a query atual (inclui ?sel=YYYY-MM-DD_HH:mm)
    const qs = search?.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, search])

  async function handleProvider(provider?: string) {
    setError(null)
    setLoading(true)
    const res = await signIn(provider ?? "google", { redirect: false, callbackUrl })
    setLoading(false)
    if (res?.ok) {
      onClose()
      // Mantém usuário na mesma página e com a seleção
      if (res.url) router.replace(res.url)
      else router.refresh()
    } else if (res?.error) {
      setError(res.error)
    }
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    })
    setLoading(false)
    if (res?.ok) {
      onClose()
      if (res.url) router.replace(res.url)
      else router.refresh()
    } else if (res?.error) {
      setError(res.error || "Falha ao entrar. Verifique suas credenciais.")
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="bg-background w-full max-w-md rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <LogIn className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Entrar para continuar</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Sua seleção de horário será mantida após o login.</p>

        {error && <div className="mb-3 text-sm text-destructive">{error}</div>}

        {/* Social */}
        <div className="flex flex-col gap-2 mb-4">
          <Button disabled={loading} onClick={() => handleProvider("google")}>
            Continuar com Google
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Credentials */}
        <form onSubmit={handleCredentials} className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? "Entrando..." : "Login com e-mail/senha"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </form>
      </div>
    </div>
  )
}
