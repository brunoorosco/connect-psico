// app/(onde-estiver)/ConsultationSession.tsx
"use client"

import React, { useState, useRef, useEffect, startTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Save, FileText, Download, AlertTriangle } from "lucide-react"
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
import { getPresignedPutForKey, transcribeChunk } from "@/services/minioUpload"
import { SummaryResult, summarizeAllText } from "@services/summarize"

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

  // ====== CAMPOS ======
  const [consultationDate, setConsultationDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [consultationTime, setConsultationTime] = useState(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null) // se quiser download local
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

  const setPatient = usePatientStore((state) => state.setPatient)
  const patient = usePatientStore((state) => state.patient)
  const [patientName, setPatientName] = useState(patient?.name ?? "")
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)

  const storageKey = useMemo(
    () => `consult:draft:${patientId}:${id}:${consultationDate}`,
    [patientId, id, consultationDate]
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
    } catch (e) {
      console.error("Falha ao restaurar rascunho:", e)
    }
  }, [storageKey])

  // Autosave
  useEffect(() => {
    const h = setTimeout(() => {
      try {
        const payload = { notes, transcript, updatedAt: Date.now() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
        setLastSavedAt(payload.updatedAt)
      } catch (e) {
        console.error("Falha ao salvar rascunho:", e)
      }
    }, 800)
    return () => clearTimeout(h)
  }, [notes, transcript, storageKey])

  useEffect(() => {
    setPatientName(patient?.name ?? "")
  }, [patient?.name])

  const { requestPermission, start, stop, isRecording, recordingTime, isStopping, canRecord, error } = useAudioRecorder(
    {
      mode: "dual",
      partDurationMs: 10_000,
      overlapMs: 400,
      timeslice: 250,
      onPart: async (blob, { index }) => {
        const sid = sessionIdRef.current!
        const key = `sessions/${sid}/part-${String(index).padStart(5, "0")}.webm`

        // upload com retry
        await withRetry(
          async () => {
            const { url } = await getPresignedPutForKey(key)
            const resp = await fetch(url, { method: "PUT", body: blob })
            if (!resp.ok) throw new Error(`PUT failed: ${resp.status}`)
          },
          4,
          300
        )

        // transcrever com retry
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
          500
        )

        const piece = stt?.text?.trim()
        if (piece) {
          setTranscript((prev) => mergeTranscripts(prev, piece))
          setSummary((prev) => mergeTranscripts(prev ?? "", piece, "\n"))
        }
        // 3) Apagar o arquivo do MinIO (após transcrição)
        try {
          await withRetry(
            async () => {
              const resp = await fetch("/api/audio/recordings/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // softDelete: true -> move para trash/sessions/..., em vez de deletar
                body: JSON.stringify({ key, softDelete: false }),
              })
              if (!resp.ok) throw new Error(await resp.text())
            },
            3,
            400
          )
        } catch (e) {
          // se falhar, não bloqueia o fluxo; ficará para um cleanup posterior (opcional)
          console.warn("Falha ao remover parte após STT:", e, { key })
        }
      },
      onStop: async (fullBlob) => {
        // opcional: manter arquivo final local pra download
        setAudioBlob(fullBlob)
      },
    }
  )

  // Start: garante sessionId e permissão antes de iniciar o hook
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

  // ====== Templates ======
  async function loadTemplates() {
    try {
      setTemplatesLoading(true)
      const res = await fetch(`/api/templates?scope=all`)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      const items: TemplateItem[] = Array.isArray(raw) ? raw : raw?.items ?? []
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
  }, [patient?.name, rg, cpf, idade, consultationTime, cid, days])

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
      const result = await summarizeAllText({ text: fullText, language: "pt-BR" })
      setAiSummary(result)
    } catch (e) {
      console.error(e)
      toast.error("Falha ao gerar resumo")
    } finally {
      setSummLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
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

            {/* 🎙️ Gravação */}
            <Card className="bg-muted/40 border-none shadow-none sm:border sm:shadow-sm">
              <CardContent className="pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Botão de gravação */}
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

                {/* Botões secundários — empilhados no mobile */}
                <div className="grid grid-cols-1 sm:flex sm:gap-3 gap-2 pt-3">
                  <Button
                    onClick={openIssueModal}
                    variant="outline"
                    className="w-full sm:w-auto"
                    title={!canIssueDocument ? "Finalize a consulta para emitir" : "Emitir documento"}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Emitir Documento
                  </Button>

                  <Button
                    onClick={handleSummarize}
                    variant="secondary"
                    disabled={summLoading || (!transcript && !notes) || !!aiSummary || isRecording}
                    className="w-full sm:w-auto"
                  >
                    {summLoading ? "Resumindo..." : "Gerar Resumo"}
                  </Button>

                  <Button onClick={saveConsultation} className="w-full sm:w-auto text-white" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Salvando..." : "Salvar Consulta"}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
