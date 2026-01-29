// app/(onde-estiver)/ConsultationSession.tsx
"use client"

import React, { useState, useRef, useEffect, startTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Save, FileText, AlertTriangle, Video, Copy, Check, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { useConsultationForm } from "@hooks/useConsultation"
import { usePatientStore } from "@/infra/stores/usePatientStore"
import { getPatientByUserId } from "@/actions/patients"
import { calcularIdade } from "@/utils/calcAge"
import { useCurrentUser } from "@hooks/use-current-user"
import { CertificateType } from "@components/settings/atestado/types"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { generateCertificatePdf } from "@/infra/pdf/generateTemplatesPdf"
import { useAudioRecorder } from "@hooks/useAudioRecorder"
import IssueDocumentDialog from "@components/consulta/ModalTemplateGenerator"

// serviços
import { startAsyncTranscription } from "@/services/consultationService"
import { useSocket } from "@/infra/contexts/SocketContext"
import { getPresignedPutForKey, transcribeChunk, putToPresignedUrl } from "@/services/minioUpload"
import { SummaryResult } from "./types"
import { useChatStore } from "@/infra/stores/useChatStore"
import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"

type CertificateConfig = any

type TemplateItem = {
  id: string | number
  name?: string
  type: CertificateType
  configJson: CertificateConfig
}

function mergeTranscripts(prev: string, curr: string, sep = " ") {
  const tail = prev.slice(-120)
  const max = Math.min(120, curr.length)
  for (let n = max; n >= 20; n--) {
    if (tail.endsWith(curr.slice(0, n))) {
      return prev + curr.slice(n)
    }
  }
  return prev ? prev + sep + curr : curr
}

const ConsultationSession = () => {
  const router = useRouter()
  const params = useParams()
  const currentUser = useCurrentUser()
  const { patientId, id } = params as { patientId: string; id: string }

  // ====== ÁUDIO / TRANSCRIÇÃO ======
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [withTimestamps, setWithTimestamps] = useState(false)
  const sessionIdRef = useRef<string | null>(null)

  // ====== VIDEOCHAMADA RÁPIDA ======
  const [roomId, setRoomId] = useState<string | null>(null)
  const [roomUrl, setRoomUrl] = useState<string>("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [copied, setCopied] = useState(false)

  // ====== CAMPOS ======
  const [consultationDate, setConsultationDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [consultationTime, setConsultationTime] = useState(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [canIssueDocument, setCanIssueDocument] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { form, handleSubmit } = useConsultationForm({})
  const [isChecking, setIsChecking] = useState(true)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [docType, setDocType] = useState<CertificateType>("atestado")
  const [cid, setCid] = useState<string>("")
  const [days, setDays] = useState<number>(3)
  const [rg, setRg] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [sintomas, setSintomas] = useState("")
  const [aiSummary, setAiSummary] = useState<SummaryResult | null>(null)
  const [summLoading, setSummLoading] = useState(false)
  const { socket } = useSocket()

  const setPatient = usePatientStore((state) => state.setPatient)
  const patient = usePatientStore((state) => state.patient)
  const [patientName, setPatientName] = useState(patient?.name ?? "")
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const { sendMessage } = useChatStore()

  const storageKey = useMemo(
    () => `consult:draft:${patientId}:${id}:${consultationDate}`,
    [patientId, id, consultationDate],
  )

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  async function withRetry<T>(fn: () => Promise<T>, tries = 3, base = 300): Promise<T> {
    let last: unknown
    for (let i = 0; i < tries; i++) {
      try {
        return await fn()
      } catch (e) {
        last = e
        if (i < tries - 1) await sleep(base * 2 ** i)
      }
    }
    throw last
  }

  useEffect(() => {
    const fetchPatient = async () => {
      if (patient?.userId === patientId) {
        setIsChecking(false)
        return
      }
      try {
        const data = await getPatientByUserId(patientId)
        if (data && "id" in data && "name" in data) {
          setPatient(data)
        } else {
          router.push("/pacientes")
        }
      } catch (error) {
        console.error("Erro ao buscar paciente:", error)
      } finally {
        setIsChecking(false)
      }
    }
    startTransition(fetchPatient)
  }, [patientId, router, setPatient, patient?.userId])

  // Restaura rascunho salvo (se existir)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return
      const obj = JSON.parse(saved)
      if (typeof obj?.notes === "string") setNotes(obj.notes)
      if (typeof obj?.transcript === "string") setTranscript(obj.transcript)
      if (typeof obj?.updatedAt === "number") setLastSavedAt(obj.updatedAt)
      if (typeof obj?.roomId === "string") setRoomId(obj.roomId)
    } catch (e) {
      console.error("Falha ao restaurar rascunho:", e)
    }
  }, [storageKey])

  useEffect(() => {
    if (!socket) return

    function onProcessed(data: any) {
      console.log("Consultation processed:", data)
      if (data.sessionId === sessionIdRef.current) {
        if (data.text) setTranscript(data.text)
        if (data.summary) {
          setAiSummary(data.summary)
          toast.success("Resumo gerado com sucesso!")
        }
        setSummLoading(false)
      }
    }

    socket.on("consultation.processed", onProcessed)
    return () => {
      socket.off("consultation.processed", onProcessed)
    }
  }, [socket])

  // Autosave
  useEffect(() => {
    const h = setTimeout(() => {
      try {
        const payload = { notes, transcript, roomId, updatedAt: Date.now() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
        setLastSavedAt(payload.updatedAt)
      } catch (e) {
        console.error("Falha ao salvar rascunho:", e)
      }
    }, 800)
    return () => clearTimeout(h)
  }, [notes, transcript, roomId, storageKey])

  useEffect(() => {
    setPatientName(patient?.name ?? "")
  }, [patient?.name])

  // Atualiza URL da sala quando roomId muda
  useEffect(() => {
    if (roomId && currentUser?.id) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const url = `${baseUrl}/app/${currentUser.id}/videochamada/room/${roomId}`
      setRoomUrl(url)
      sendMessageLinkUrlRoom(url)
    }
  }, [roomId, currentUser?.id])

  const sendMessageLinkUrlRoom = async (url: string) => {
    console.log("patient :>> ", patient)
    await sendMessage({
      text: url,
      image: "",
      receiverId: patientId,
      senderId: currentUser?.id as string,
    })
    if (!patient?.phone) return
    const message = `🔗 *Link da Sessão*\n\n${url}`
    await sendMessageApiWhatsapp(patient.phone, message)
  }

  const { requestPermission, start, stop, isRecording, recordingTime, isStopping, canRecord, error } = useAudioRecorder(
    {
      mode: "dual",
      partDurationMs: 10_000,
      overlapMs: 400,
      timeslice: 250,
      onPart: async (blob, { index }) => {
        const sid = sessionIdRef.current!
        const key = `sessions/${sid}/part-${String(index).padStart(5, "0")}.webm`

        await withRetry(
          async () => {
            const { url } = await getPresignedPutForKey(key)
            const resp = await fetch(url, { method: "PUT", body: blob })
            if (!resp.ok) throw new Error(`PUT failed: ${resp.status}`)
          },
          4,
          300,
        )

        const stt = await withRetry(
          () =>
            transcribeChunk({
              key,
              sessionId: sid,
              part: index,
              response_format: withTimestamps ? "verbose_json" : "json",
              language: "pt",
            }),
          3,
          500,
        )

        const piece = stt?.text?.trim()
        if (piece) {
          setTranscript((prev) => mergeTranscripts(prev, piece))
          setSummary((prev) => mergeTranscripts(prev ?? "", piece, "\n"))
        }

        try {
          await withRetry(
            async () => {
              const resp = await fetch("/api/audio/recordings/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, softDelete: false }),
              })
              if (!resp.ok) throw new Error(await resp.text())
            },
            3,
            400,
          )
        } catch (e) {
          console.warn("Falha ao remover parte após STT:", e, { key })
        }
      },
      onStop: async (fullBlob) => {
        setAudioBlob(fullBlob)
      },
    },
  )

  const handleStart = async () => {
    if (!sessionIdRef.current) {
      const s = (crypto as any)?.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`
      sessionIdRef.current = s
    }
    if (!canRecord) {
      const ok = await requestPermission()
      if (!ok) return
    }
    await start()
  }

  const handleStop = () => {
    stop()
  }

  const saveConsultation = async () => {
    setIsSubmitting(true)
    try {
      await handleSubmit({
        notes: notes,
        patientId: patient?.id ?? 0,
        professionalId: id,
      })
      toast.success("Consulta salva", {
        description: "Os dados da consulta foram salvos com sucesso",
      })
      setCanIssueDocument(true)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error("Erro ao finalizar consulta:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadTemplates() {
    try {
      setTemplatesLoading(true)
      const res = await fetch(`/api/templates?scope=all`)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      const items: TemplateItem[] = Array.isArray(raw) ? raw : (raw?.items ?? [])
      const normalized = items
        .map((it) => {
          const t = (it?.name || it?.configJson?.type || "atestado") as CertificateType
          return { ...it, type: t, configJson: { ...(it?.configJson || {}), type: t } as CertificateConfig }
        })
        .filter((it) => it?.type)
      setTemplates(normalized)
      const firstType = (normalized.find((i) => i.type === "atestado")?.type ??
        normalized[0]?.type ??
        "atestado") as CertificateType
      setDocType(firstType)
    } catch (e) {
      console.error("Falha ao carregar templates:", e)
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const configByType = useMemo(() => {
    const map: Partial<Record<CertificateType, CertificateConfig>> = {}
    for (const it of templates) map[it.type] = it.configJson
    return map
  }, [templates])

  const selectedConfig = useMemo<CertificateConfig | undefined>(() => {
    return docType ? configByType[docType] : undefined
  }, [docType, configByType])

  const idade = useMemo(() => {
    const v = calcularIdade(patient?.birthDate as any)
    return v == null ? "" : String(v)
  }, [patient?.birthDate])

  const patientDataForDoc = useMemo(() => {
    return {
      paciente: patient?.name ?? "",
      rg: rg || patient?.rg || "",
      cpf: cpf || patient?.cpf || "",
      idade,
      modalidade: "online",
      data: consultationDate,
      horario: consultationTime,
      cid: cid || "",
      sintomas: sintomas || "",
      dias: days || 0,
      dataExtenso: format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    }
  }, [patient?.name, rg, cpf, idade, consultationTime, cid, days, consultationDate])

  async function handleEmitDocument() {
    if (!selectedConfig) return
    const userForDoc = {
      name: currentUser?.name || "Profissional",
      crp: (currentUser as any)?.crp || "",
    }
    await generateCertificatePdf(selectedConfig, userForDoc, patientDataForDoc)
    setIssueOpen(false)
  }

  async function openIssueModal() {
    if (!templates.length) await loadTemplates()
    if (patient?.rg) setRg(patient.rg)
    if (patient?.cpf) setCpf(patient.cpf)
    setIssueOpen(true)
  }

  async function handleSummarize() {
    try {
      setSummLoading(true)
      const fullText = [transcript, notes].filter(Boolean).join("\n\n")

      if (audioBlob && sessionIdRef.current) {
        toast.info("Iniciando processamento em segundo plano...", { description: "Isso pode levar alguns minutos." })
        const sid = sessionIdRef.current
        const key = `sessions/${sid}/full.webm`

        await withRetry(async () => {
          const { url } = await getPresignedPutForKey(key)
          await putToPresignedUrl(url, audioBlob)
        }, 3)

        await startAsyncTranscription(sid, key, "pt-BR", currentUser?.id, fullText)
      } else {
        if (transcript || notes) {
          toast.info("Gerando resumo a partir do texto...", { description: "Processando em segundo plano." })
          const sid = sessionIdRef.current || `s-${Date.now()}`
          sessionIdRef.current = sid
          await startAsyncTranscription(sid, undefined, "pt-BR", currentUser?.id, fullText)
        } else {
          toast.error("Nada para resumir (sem áudio/texto)")
          setSummLoading(false)
        }
      }
    } catch (e: any) {
      console.error(e)
      toast.error(`Falha ao solicitar resumo: ${e?.message ?? "Erro desconhecido"}`)
      setSummLoading(false)
    }
  }

  /**
   * Cria uma sala de videochamada ad-hoc e abre em nova aba
   */
  const handleCreateAndJoinRoom = async () => {
    if (!currentUser?.id) {
      toast.error("Erro ao identificar usuário")
      return
    }

    setIsCreatingRoom(true)

    try {
      const response = await fetch("/api/rooms/quick-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapistId: currentUser.id,
          patientId: patientId,
          scheduledFor: `${consultationDate}T${consultationTime}`,
          type: "ad-hoc",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar sala")
      }

      const data = await response.json()
      const newRoomId = data.roomId

      setRoomId(newRoomId)

      // Abrir sala em nova aba
      const roomUrl = `/app/${currentUser.id}/videochamada/room/${newRoomId}`
      const newWindow = window.open(roomUrl, "_blank", "noopener,noreferrer")

      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        toast.warning("Pop-up bloqueado", {
          description: "Clique no botão 'Abrir Sala' para entrar manualmente",
        })
      } else {
        toast.success("Sala criada com sucesso!", {
          description: "A videochamada foi aberta em uma nova aba",
        })
      }
    } catch (error) {
      console.error("Erro ao criar sala:", error)
      toast.error("Erro ao criar sala online", {
        description: "Tente novamente em alguns instantes",
      })
    } finally {
      setIsCreatingRoom(false)
    }
  }

  /**
   * Copia o link da sala para a área de transferência
   */
  const handleCopyRoomLink = async () => {
    if (!roomUrl) return

    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast.success("Link copiado!", {
        description: "Compartilhe com o paciente para iniciar a sessão",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Erro ao copiar link", {
        description: "Tente copiar manualmente",
      })
    }
  }

  /**
   * Abre a sala novamente (caso o terapeuta feche a aba)
   */
  const handleRejoinRoom = () => {
    if (roomUrl) {
      window.open(roomUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-background sm:p-2">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="shadow-sm border-none sm:border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Sessão</CardTitle>

            {/* ⚠️ Alerta ético */}
            <div
              className="flex flex-col sm:flex-row sm:items-start gap-2 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-3 mt-2"
              role="alert"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-800 leading-snug">
                O uso de gravação sem consentimento assinado do paciente fere o{" "}
                <strong>Art. 9º do Código de Ética</strong>. Garanta o registro digital antes de prosseguir.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 🧍 Informações do paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="patient-name">Nome do Paciente</Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation-date">Data</Label>
                <Input
                  id="consultation-date"
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation-time">Horário</Label>
                <Input
                  id="consultation-time"
                  type="time"
                  value={consultationTime}
                  onChange={(e) => setConsultationTime(e.target.value)}
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid xl:grid-cols-2 grid-cols-1">
              {/* 📹 VIDEOCHAMADA RÁPIDA */}
              <Card className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-blue-900 dark:text-blue-100 flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Videochamada Online
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!roomId ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Inicie uma sessão por videochamada sem necessidade de agendamento prévio.
                      </p>
                      <Button
                        onClick={handleCreateAndJoinRoom}
                        disabled={isCreatingRoom}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        {isCreatingRoom ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Criando sala...
                          </>
                        ) : (
                          <>
                            <Video className="w-5 h-5 mr-2" />
                            Iniciar Videochamada
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        <span className="font-medium">Sala ativa</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Link da Sala (compartilhe com o paciente)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={roomUrl}
                            readOnly
                            className="font-mono text-xs bg-white dark:bg-gray-900"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <Button
                            onClick={handleCopyRoomLink}
                            variant="outline"
                            size="icon"
                            className="flex-shrink-0"
                            title="Copiar link"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        ID da Sala: <span className="font-mono font-semibold">{roomId}</span>
                      </div>

                      <Button onClick={handleRejoinRoom} variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Sala Novamente
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 🎙️ Gravação */}
              <Card className="bg-muted/40 border-none shadow-none sm:border sm:shadow-sm">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      onClick={isRecording ? handleStop : handleStart}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {isRecording ? <MicOff /> : <Mic />}
                      <span className="ml-2">
                        {isRecording ? (isStopping ? "Parando..." : "Parar Gravação") : "Iniciar Gravação"}
                      </span>
                    </Button>

                    {isRecording && (
                      <div className="flex justify-center sm:justify-start items-center gap-2">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                        <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 sm:grid-cols-1 sm:gap-3 gap-2 pt-3">
                    <Button
                      onClick={openIssueModal}
                      variant="outline"
                      className="grid-cols-1"
                      title={!canIssueDocument ? "Finalize a consulta para emitir" : "Emitir documento"}
                    >
                      <FileText className="w-4 h-4 mr-20" color="#2563eb"/>
                      Emitir Documento
                    </Button>

                    <Button
                      onClick={handleSummarize}
                      variant="secondary"
                      disabled={summLoading || (!transcript && !notes) || !!aiSummary || isRecording}
                      className=" grid-cols-1"
                    >
                      {summLoading ? "Resumindo..." : "Gerar Resumo"}
                    </Button>

                    <Button onClick={saveConsultation} className="text-white grid-cols-1" disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Salvando..." : "Salvar Consulta"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 🧾 Transcrição */}
            {transcript && (
              <div className="space-y-2">
                <Label>Transcrição Parcial</Label>
                <Textarea value={transcript} readOnly rows={5} className="min-h-[100px]" />
              </div>
            )}

            {/* 🗒️ Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Anotações da Sessão</Label>
              <Textarea
                id="notes"
                placeholder="Digite suas anotações..."
                value={notes}
                rows={6}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[160px] resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length} caracteres</p>
            </div>

            {/* 🤖 Resumo IA */}
            {aiSummary && (
              <Card className="mt-4 bg-muted/30 border-none sm:border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Resumo IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>{aiSummary.summary}</p>

                  {aiSummary.key_points?.length > 0 && (
                    <div>
                      <Label>Pontos-chave</Label>
                      <ul className="list-disc ml-5 space-y-1">
                        {aiSummary.key_points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.action_items?.length > 0 && (
                    <div>
                      <Label>Itens de Ação</Label>
                      <ul className="list-disc ml-5 space-y-1">
                        {aiSummary.action_items.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <IssueDocumentDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        templates={templates}
        templatesLoading={templatesLoading}
        docType={docType}
        onDocTypeChange={setDocType}
        rg={rg}
        onChangeRg={setRg}
        cpf={cpf}
        onChangeCpf={setCpf}
        sintomas={sintomas}
        onChangeSintomas={setSintomas}
        cid={cid}
        onChangeCid={setCid}
        days={days}
        onChangeDays={setDays}
        consultationTime={consultationTime}
        onChangeConsultationTime={setConsultationTime}
        onGenerate={handleEmitDocument}
        canGenerate={!!selectedConfig}
      />
    </div>
  )
}

export default ConsultationSession
