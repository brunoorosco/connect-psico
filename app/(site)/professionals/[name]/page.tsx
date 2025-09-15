"use client"
import React from "react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react" // v5 client
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  Award,
  Star,
  Mail,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  LogIn,
  AlertCircle,
} from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import { Input, Label } from "@components/ui"
import { getProfessionalByUsername } from "@/actions/users/getProfissionalsByUsername"
import { Professional } from "@/types/appointment"
import { ProfessionalModel } from "@/domain/model/professional"

// =============================
// Types
// =============================

type Slot = { time: string; available: boolean; date?: string } // date in YYYY-MM-DD (UTC midnight relative)
type WeekKeys = "monday" | "tuesday" | "wednesday" | "thursday" | "friday"

type WeeklySchedule = Record<WeekKeys, Slot[]>

// =============================
// Server Action (coloque em um arquivo server, ex.: app/(app)/appointments/actions.ts)
// =============================
// "use server" // <- Mova este bloco para um arquivo separado no lado do servidor
// export async function bookAppointmentAction(formData: FormData) {
//   "use server";
//   const professionalId = String(formData.get("professionalId"));
//   const isoDate = String(formData.get("isoDate")); // ex.: 2025-09-12T14:00:00.000Z
//   const notes = String(formData.get("notes") || "");
//   // TODO: recuperar usuário logado pelo auth() e persistir no banco
//   // await prisma.appointment.create({ data: { professionalId, userId, startsAt: new Date(isoDate), notes } })
//   return { ok: true };
// }

// =============================
// Helpers de data
// =============================
const daysOfWeek: { key: WeekKeys; label: string; weekdayIndex: number }[] = [
  { key: "monday", label: "Segunda-feira", weekdayIndex: 1 },
  { key: "tuesday", label: "Terça-feira", weekdayIndex: 2 },
  { key: "wednesday", label: "Quarta-feira", weekdayIndex: 3 },
  { key: "thursday", label: "Quinta-feira", weekdayIndex: 4 },
  { key: "friday", label: "Sexta-feira", weekdayIndex: 5 },
]

function startOfWeekMonday(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0-6 (Sun=0)
  const diff = (day === 0 ? -6 : 1) - day // move para segunda
  date.setUTCDate(date.getUTCDate() + diff)
  date.setUTCHours(0, 0, 0, 0)
  return date // UTC 00:00 de segunda
}

function addDaysUTC(dateUTC: Date, days: number) {
  const d = new Date(dateUTC)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function formatYMD(dateUTC: Date) {
  const y = dateUTC.getUTCFullYear()
  const m = String(dateUTC.getUTCMonth() + 1).padStart(2, "0")
  const d = String(dateUTC.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function composeSlotISO(dateYMD: string, timeHHMM: string) {
  // cria Date UTC a partir de Y-M-D e HH:mm no fuso -03 (America/Sao_Paulo)
  const [hh, mm] = timeHHMM.split(":").map(Number)
  const [y, m, d] = dateYMD.split("-").map(Number)
  // Offset fixo -03:00 (ajuste se usar tz dinamicamente)
  const utcHour = hh + 3 // -03 -> +3 em UTC
  return new Date(Date.UTC(y, m - 1, d, utcHour, mm, 0, 0)).toISOString()
}

// =============================
// Mock (fallback local)
// =============================
const mockProfessional: Professional = {
  id: 1,
  name: "Dra. Ana Carolina Silva",
  specialty: "Psicologia Clínica",
  approach: "Terapia Cognitivo-Comportamental",
  avatar: "/placeholder.svg",
  location: "São Paulo, SP",
  experience: "8 anos de experiência",
  rating: 4.9,
  reviews: 127,
  education: [
    "Mestrado em Psicologia Clínica - USP",
    "Especialização em TCC - PUC-SP",
    "Graduação em Psicologia - UNIFESP",
  ],
  certifications: ["CRP 06/123456", "Certificação em EMDR", "Formação em Terapia de Casal"],
  bio: "Psicóloga clínica com mais de 8 anos de experiência...",
  email: "ana.silva@email.com",
  phone: "(11) 99999-9999",
}

const mockWeek: WeeklySchedule = {
  monday: [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: false },
    { time: "11:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: false },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
  ],
  tuesday: [
    { time: "08:00", available: false },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "14:00", available: false },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: false },
  ],
  wednesday: [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: false },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: false },
    { time: "17:00", available: true },
  ],
  thursday: [
    { time: "08:00", available: false },
    { time: "09:00", available: false },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
  ],
  friday: [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: false },
    { time: "11:00", available: false },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: false },
  ],
}

// =============================
// Componentes
// =============================

function WeekNavigator({
  weekStartUTC,
  onPrev,
  onNext,
  disablePrev,
}: {
  weekStartUTC: Date
  onPrev: () => void
  onNext: () => void
  disablePrev?: boolean
}) {
  const end = addDaysUTC(weekStartUTC, 4)
  const label = `${formatYMD(weekStartUTC)} → ${formatYMD(end)}`
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">Semana: {label}</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={disablePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ScheduleGrid({
  weekStartUTC,
  weekData,
  selected,
  onSelect,
}: {
  weekStartUTC: Date
  weekData: WeeklySchedule
  selected: { ymd: string; time: string } | null
  onSelect: (payload: { ymd: string; time: string }) => void
}) {
  return (
    <div className="space-y-4">
      {daysOfWeek.map((day, idx) => {
        const date = addDaysUTC(weekStartUTC, idx)
        const ymd = formatYMD(date)
        const slots = weekData[day.key] || []
        return (
          <div key={day.key} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-foreground">
              {day.label} <span className="text-muted-foreground text-xs">{ymd}</span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {slots.map((slot, i) => {
                const isSelected = selected && selected.ymd === ymd && selected.time === slot.time
                const base = slot.available ? "border-primary text-primary" : "opacity-50 cursor-not-allowed"
                return (
                  <Button
                    key={`${day.key}-${i}`}
                    variant={slot.available ? (isSelected ? "default" : "outline") : "default"}
                    size="sm"
                    className={`text-xs ${base} ${
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    disabled={!slot.available}
                    onClick={() => onSelect({ ymd, time: slot.time })}
                  >
                    {slot.time}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LoginBanner({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <Alert className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>É necessário estar logado</AlertTitle>
      <AlertDescription>
        Para finalizar o agendamento você precisa estar logado.{" "}
        <Button variant="link" onClick={onOpenLogin}>
          Fazer login
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const search = useSearchParams()
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/"
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const callbackUrl = React.useMemo(() => {
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
function BookButton({
  professionalId,
  selected,
  onBooked,
}: {
  professionalId: string | number
  selected: { ymd: string; time: string } | null
  onBooked?: () => void
}) {
  const { status } = useSession()
  const isLogged = status === "authenticated"
  const [isPending, startTransition] = useTransition()

  const disabled = !isLogged || !selected || isPending

  // Submissão via Server Action (form)
  const iso = selected ? composeSlotISO(selected.ymd, selected.time) : ""

  async function clientSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    // Exemplo de chamada para uma rota api se preferir, enquanto a action não está criada
    // await fetch("/api/appointments", { method: "POST", body: JSON.stringify({ professionalId, isoDate: iso }) })
    // Se for usar server action:
    // startTransition(async () => {
    //   const res = await bookAppointmentAction(formData) // import do server
    //   if (res?.ok) onBooked?.();
    // });
    startTransition(async () => {
      // Placeholder
      await new Promise((r) => setTimeout(r, 600))
      onBooked?.()
    })
  }

  return (
    <form onSubmit={clientSubmit} className="w-full">
      {/* Hidden fields para futura Server Action */}
      <input name="professionalId" defaultValue={String(professionalId)} hidden readOnly />
      <input name="isoDate" defaultValue={iso} hidden readOnly />
      <Button type="submit" className="w-full" disabled={disabled}>
        <Calendar className="h-4 w-4 mr-2" />
        {isPending ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </form>
  )
}

// =============================
// Página principal
// =============================
export default function ProfessionalProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const search = useSearchParams()

  const [professional, setProfessional] = useState<ProfessionalModel | null>(null)
  const [weekData, setWeekData] = useState<WeeklySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = semana atual, 1 = próxima, etc.
  const [selected, setSelected] = useState<{ ymd: string; time: string } | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)

  // Semana atual (UTC Monday) + offset
  const weekStartUTC = useMemo(() => {
    const base = startOfWeekMonday(new Date())
    return addDaysUTC(base, weekOffset * 7)
  }, [weekOffset])

  // Manter seleção na URL (opcional) para persistir pós-login
  useEffect(() => {
    const sel = search.get("sel")
    if (sel && !selected) {
      // formato: YYYY-MM-DD_HH:mm
      const [ymd, time] = sel.split("_")
      if (ymd && time) setSelected({ ymd, time })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      try {
        const nickname = params?.name as string // adapte conforme sua rota
        // ======= BUSCAR DADOS DO PROFISSIONAL =======
        // const resPro = await fetch(`/api/professionals/${professionalId}`, { signal: controller.signal });
        // const prof: Professional = await resPro.json();
        // setProfessional(prof);
        const terapeuta = await getProfessionalByUsername(nickname)
        console.log(terapeuta)
        setProfessional(terapeuta)

        // ======= BUSCAR AGENDA DA SEMANA =======
        const from = formatYMD(weekStartUTC)
        // const resWeek = await fetch(`/api/professionals/${professionalId}/availability?from=${from}&days=5`, { signal: controller.signal });
        // const week: WeeklySchedule = await resWeek.json();
        // setWeekData(week);
        setWeekData(mockWeek)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [params, weekStartUTC])

  function handleSelectSlot(payload: { ymd: string; time: string }) {
    setSelected(payload)
    // se não logado, mostrar banner e modal opcional
    const isLogged = !!session?.user
    if (!isLogged) {
      setLoginOpen(true)
    }
    // gravar na URL para persistir após login
    const newSearch = new URLSearchParams(search?.toString())
    newSearch.set("sel", `${payload.ymd}_${payload.time}`)
    router.replace(`?${newSearch.toString()}`)
  }

  const isLogged = !!session?.user

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={professional?.image as string} alt={professional?.name ?? ""} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {(professional?.name || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{professional?.name}</h1>
                    <p className="text-muted-foreground mb-2">{professional?.especialidade.join(", ")}</p>
                    <Badge variant={professional?.active ? "secondary" : "default"} className="mb-4">
                      {professional?.active ? "Ativo" : "Inativo"}
                      {/* {professional?.publicoAlvo?.join(", ")} */}
                    </Badge>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{4.9}</span>
                      <span className="text-muted-foreground">({100} avaliações)</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>São Paulo/SP</span>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">Mais de {professional?.experiencia} anos de experiência</p> */}
                    <p className="font-medium text-muted-foreground"> Público Alvo</p>
                    <p className="text-sm text-muted-foreground"> {professional?.publicoAlvo?.join(", ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{professional?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional?.phone}</span>
                </div>
                <BookButton
                  professionalId={professional?.id ?? ""}
                  selected={selected}
                  onBooked={() => alert("Agendado! (substitua por toast)")}
                />
                {!isLogged && selected && <LoginBanner onOpenLogin={() => setLoginOpen(true)} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(professional?.education) ? (
                    professional.education.map((edu, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {edu}
                      </li>
                    ))
                  ) : professional?.education ? (
                    <li className="text-sm text-muted-foreground">• {professional.education}</li>
                  ) : null}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificações
                </CardTitle>
              </CardHeader>
              {/* <CardContent>
                <ul className="space-y-2">
                  {(professional?.certifications ?? []).map((cert, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {cert}
                    </li>
                  ))}
                </ul>
              </CardContent> */}
            </Card>
          </div>

          {/* Coluna direita */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{professional?.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Disponibilidade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <WeekNavigator
                    weekStartUTC={weekStartUTC}
                    onPrev={() => setWeekOffset((o) => Math.max(0, o - 1))}
                    onNext={() => setWeekOffset((o) => o + 1)}
                    disablePrev={weekOffset === 0}
                  />
                </div>

                {loading ? (
                  <div className="text-sm text-muted-foreground">Carregando agenda...</div>
                ) : weekData ? (
                  <>
                    <ScheduleGrid
                      weekStartUTC={weekStartUTC}
                      weekData={weekData}
                      selected={selected}
                      onSelect={handleSelectSlot}
                    />
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-primary rounded" />
                          <span>Disponível</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-muted-foreground rounded" />
                          <span>Ocupado</span>
                        </div>
                        {selected && (
                          <div className="ml-auto text-xs">
                            Selecionado: <strong>{selected.ymd}</strong> às <strong>{selected.time}</strong>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Clique em um horário disponível para selecionar e depois em "Agendar Consulta".
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Sem dados de agenda.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
