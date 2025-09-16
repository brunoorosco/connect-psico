"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, GraduationCap, Award, Star, Mail, Phone, MessageCircle } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import { LoginModal } from "@components/profissional/me/LoginModal"
import { addDaysUTC, formatYMD, startOfWeekMonday } from "@components/profissional/me/helpers"
import { WeekNavigator } from "@components/profissional/me/WeekNavigator"
import { ScheduleGrid } from "@components/profissional/me/ScheduleGrid"
import { LoginBanner } from "@components/profissional/me/LoginBanner"
import { WeeklySchedule } from "@components/profissional/me/types"
import { BookButton } from "@components/profissional/me/BookButton"
import { useProfessionalsUsername } from "@hooks/useProfissionals"

// === NOVO: baseline vazio 09:00–18:00 ===
const HOURS = Array.from({ length: 8 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`) // 09..17
const buildEmptyWeek = (): WeeklySchedule => {
  const day = HOURS.map((time) => ({ time, available: false }))
  return {
    monday: [...day],
    tuesday: [...day],
    wednesday: [...day],
    thursday: [...day],
    friday: [...day],
    saturday: [...day],
    sunday: [...day],
  }
}

export default function ProfessionalProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const search = useSearchParams()

  const [weekData, setWeekData] = useState<WeeklySchedule>(buildEmptyWeek())
  const [weekOffset, setWeekOffset] = useState(0) // 0 = semana atual; positivo = futuras
  const [selected, setSelected] = useState<{ ymd: string; time: string } | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const { getProfissionalByUsername, loading, professional } = useProfessionalsUsername()
  const currentMondayUTC = useMemo(() => startOfWeekMonday(new Date()), [])
  console.log(loading, weekData, professional)

  // Semana mostrada = segunda da semana atual + offset (sempre segunda)
  const weekStartUTC = useMemo(() => addDaysUTC(currentMondayUTC, weekOffset * 7), [currentMondayUTC, weekOffset])

  // Lê URL (?sel=YYYY-MM-DD_HH:mm) e ajusta a semana automaticamente
  useEffect(() => {
    const sel = search.get("sel")
    if (!sel) return

    const [ymd, time] = sel.split("_")
    if (!ymd || !time) return

    // define seleção
    setSelected({ ymd, time })

    // calcula offset da SEMANA do ymd vs semana atual
    const [y, m, d] = ymd.split("-").map(Number)
    if (!y || !m || !d) return
    const selectedDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))

    const selectedMondayUTC = startOfWeekMonday(selectedDate)
    const diffMs = selectedMondayUTC.getTime() - currentMondayUTC.getTime()
    const weeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
    setWeekOffset(weeks)
  }, [search, currentMondayUTC])

  // Carrega profissional e (mock) semana
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const nickname = params?.name as string
        getProfissionalByUsername(nickname)

        const from = formatYMD(weekStartUTC)

        setWeekData(buildEmptyWeek())
      } catch (e) {
        console.error(e)
      } finally {
      }
    }
    load()
    return () => controller.abort()
  }, [params, weekStartUTC])

  function handleSelectSlot(payload: { ymd: string; time: string }) {
    setSelected(payload)
    const isLogged = !!session?.user
    if (!isLogged) setLoginOpen(true)

    const newSearch = new URLSearchParams(search?.toString())
    newSearch.set("sel", `${payload.ymd}_${payload.time}`)
    router.replace(`?${newSearch.toString()}`)
  }

  const isLogged = !!session?.user

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4">
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
                        .map((n) => n?.[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{professional?.name}</h1>
                    <p className="text-muted-foreground mb-2">
                      <ul className="space-y-2">
                        {Array.isArray(professional?.education) ? (
                          professional.education.map((edu, i) => (
                            <li key={i} className="text-normal text-muted-foreground">
                              {edu}
                            </li>
                          ))
                        ) : professional?.education ? (
                          <li className="text-normal text-muted-foreground">{professional.education}</li>
                        ) : null}
                      </ul>
                    </p>
                    <Badge className="bg-therapy-secondary mb-4 py-2 px-3">
                      {professional?.especialidade.join(", ")}
                    </Badge>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{4.9}</span>
                      <span className="text-muted-foreground">({100} avaliações)</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>São Paulo, SP</span>
                    </div>
                    <div className="mb-3">
                      <p className="font-medium text-muted-foreground">Público Alvo</p>
                      <p className="text-sm text-muted-foreground">{professional?.publicoAlvo?.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{professional?.experiencia} anos de experiência</p>
                    </div>
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
                ) : weekData && professional ? (
                  <>
                    <ScheduleGrid
                      weekStartUTC={weekStartUTC}
                      weekData={weekData}
                      selected={selected}
                      onSelect={handleSelectSlot}
                      professionalId={Number(professional.id)}
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
