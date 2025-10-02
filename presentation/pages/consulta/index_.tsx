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

  // limpeza MinIO
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [autoSoftDelete, setAutoSoftDelete] = useState(false)

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

  const { requestPermission, start, stop, isRecording, recordingTime, canRecord, error } = useAudioRecorder({
    mode: "dual",
    partDurationMs: 10_000,
    overlapMs: 400,
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
    },
    onStop: async (fullBlob) => {
      // opcional: manter arquivo final local pra download
      setAudioBlob(fullBlob)
    },
  })

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
      toast.error("Falha ao gerar resumo com OpenAI")
    } finally {
      setSummLoading(false)
    }
  }

  async function finalizeAndCleanup() {
    const sid = sessionIdRef.current
    if (!sid) {
      toast.error("Sessão não iniciada.")
      return
    }

    setFinalizing(true)
    try {
      // 1) parar a gravação — garante que o último onPart rode
      if (isRecording) stop()

      // 2) aguarda um tique para concluir onPart pendente
      await sleep(250)

      // 3) limpar no servidor
      setCleanupLoading(true)
      const res = await fetch("/api/recordings/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          hardDelete: !autoSoftDelete,
        }),
      })
      const data = await res.json()
      setCleanupLoading(false)

      if (!res.ok) throw new Error(data?.details || data?.error || "Falha ao apagar áudio")

      const qty = data?.deleted ?? data?.moved ?? 0
      toast.success(`Áudio removido do servidor (${qty} parte${qty === 1 ? "" : "s"})`)
    } catch (e) {
      console.error(e)
      toast.error("Falha ao finalizar e limpar o áudio")
    } finally {
      setFinalizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-2">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card>
          <CardHeader className="flex">
            <CardTitle className="text-2xl font-bold text-primary">Sessão</CardTitle>
            <div
              className="flex items-start gap-2 rounded-md border-l-4 border-yellow-400 bg-yellow-100 p-3 mb-4"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-2">
                  <p className="text-sm text-yellow-800">
                    O uso de gravação sem consentimento assinado do paciente fere o{" "}
                    <strong>Art. 9º do Código de Ética</strong>. Garanta o registro digital antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Informações */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="patient-name">Nome do Paciente</Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="consultation-date">Data da Consulta</Label>
                <Input
                  id="consultation-date"
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2 col-span-1">
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

            {/* Gravação */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={isRecording ? handleStop : handleStart}
                        variant={isRecording ? "destructive" : "default"}
                        size="lg"
                        className="flex items-center space-x-2"
                      >
                        {isRecording ? (
                          <>
                            {/* <div className="w-3 h-3 bg-white rounded-full animate-pulse" />  */}
                            <MicOff />
                          </>
                        ) : (
                          <Mic />
                        )}
                        <span>{isRecording ? "Parar Gravação" : "Iniciar Gravação"}</span>
                      </Button>

                      {/* {isRecording && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>
                  <Button
                    onClick={openIssueModal}
                    variant="outline"
                    className="flex items-center space-x-2"
                    size="lg"
                    title={!canIssueDocument ? "Finalize a consulta para emitir o documento" : "Emitir documento"}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Emitir Documento</span>
                  </Button>

                  <Button
                    onClick={handleSummarize}
                    variant="outline"
                    size="lg"
                    disabled={summLoading || (!transcript && !notes) || !!aiSummary}
                    title="Gerar resumo automático"
                  >
                    <FileText className="w-4 h-4" />
                    {summLoading ? "Resumindo..." : "Gerar Resumo"}
                  </Button>

                  <Button onClick={saveConsultation} className="flex items-center space-x-2" size="lg">
                    <Save className="w-4 h-4" />
                    <span>Salvar Consulta</span>
                  </Button>

                  <Button
                    onClick={finalizeAndCleanup}
                    variant="destructive"
                    className="flex items-center space-x-2"
                    size="lg"
                    disabled={finalizing || cleanupLoading}
                    title="Finaliza a sessão e apaga o áudio do servidor"
                  >
                    {finalizing || cleanupLoading ? "Finalizando..." : "Finalizar (apagar áudio)"}
                  </Button>
                </div>

                {/* feedback de erro do gravador */}
                {error && <p className="text-sm text-destructive mt-3">{error}</p>}
              </CardContent>
            </Card>

            {/* Transcript (preview) */}
            {transcript && (
              <div className="space-y-2">
                <Label>Transcrição parcial </Label>
                <Textarea value={transcript} readOnly rows={6} className="min-h-[120px]" />
              </div>
            )}

            {/* Anotações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Anotações da Sessão</Label>
              <Textarea
                id="notes"
                placeholder="Digite suas anotações sobre a consulta..."
                value={notes}
                rows={8}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <p className="text-sm text-muted-foreground">{notes.length} caracteres</p>
            </div>

            {aiSummary && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Resumo IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p>{aiSummary.summary}</p>
                  </div>

                  {!!aiSummary.key_points?.length && (
                    <div>
                      <Label>Pontos-chave</Label>
                      <ul className="list-disc ml-5 text-sm">
                        {aiSummary.key_points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!aiSummary.action_items?.length && (
                    <div>
                      <Label>Itens de Ação</Label>
                      <ul className="list-disc ml-5 text-sm">
                        {aiSummary.action_items.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!aiSummary.warnings?.length && (
                    <div>
                      <Label>Alertas</Label>
                      <ul className="list-disc ml-5 text-sm">
                        {aiSummary.warnings.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            {/* <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <Button
                onClick={openIssueModal}
                variant="outline"
                className="flex items-center space-x-2"
                size="lg"
                title={!canIssueDocument ? "Finalize a consulta para emitir o documento" : "Emitir documento"}
              >
                <FileText className="w-4 h-4" />
                <span>Emitir Documento</span>
              </Button>

              <Button
                onClick={handleSummarize}
                variant="secondary"
                size="lg"
                disabled={summLoading || (!transcript && !notes) || !!aiSummary}
                title="Gerar resumo automático"
              >
                {summLoading ? "Resumindo..." : "Gerar Resumo"}
              </Button>

              <Button onClick={saveConsultation} className="flex items-center space-x-2" size="lg">
                <Save className="w-4 h-4" />
                <span>Salvar Consulta</span>
              </Button>

              <Button
                onClick={finalizeAndCleanup}
                variant="destructive"
                className="flex items-center space-x-2"
                size="lg"
                disabled={finalizing || cleanupLoading}
                title="Finaliza a sessão e apaga o áudio do servidor"
              >
                {finalizing || cleanupLoading ? "Finalizando..." : "Finalizar (apagar áudio)"}
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>

      <IssueDocumentDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        templates={templates}
        templatesLoading={templatesLoading}
        docType={docType}
        onDocTypeChange={(t: CertificateType) => setDocType(t)}
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
