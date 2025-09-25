// app/(onde-estiver)/ConsultationSession.tsx
"use client"

import React, { useState, useRef, useEffect, startTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Save, FileText, Download } from "lucide-react"
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

// 💡 use sempre o MESMO caminho de services para evitar import duplicado
import { getPresignedPutForKey, transcribeChunk } from "@/services/minioUpload"

type CertificateConfig = any

type TemplateItem = {
  id: string | number
  name?: string
  type: CertificateType
  configJson: CertificateConfig
}

const ConsultationSession = () => {
  const router = useRouter()
  const params = useParams()
  const currentUser = useCurrentUser()
  const { patientId, id } = params as { patientId: string; id: string }

  // ====== ÁUDIO / TRANSCRIÇÃO ======
  const FIVE_MB = 5 * 1024 * 1024
  const chunkBufRef = useRef<Blob[]>([])
  const chunkBytesRef = useRef(0)
  const partIndexRef = useRef(0)
  const flushingRef = useRef(false)
  const [transcript, setTranscript] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bootingRef = useRef(false) // evita start duplo

  // ====== CAMPOS ======
  const [consultationDate, setConsultationDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [consultationTime, setConsultationTime] = useState(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null) // mantive se quiser download local
  const [summary, setSummary] = useState<string | null>(null)
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

  const setPatient = usePatientStore((state) => state.setPatient)
  const patient = usePatientStore((state) => state.patient)
  const [patientName, setPatientName] = useState(patient?.name ?? "")

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

  // ====== FLUSH (~5MB) -> MinIO -> Transcrição (Groq) ======
  async function flush5MBChunk(currentSessionId: string) {
    if (flushingRef.current) return
    if (chunkBytesRef.current === 0) return

    flushingRef.current = true
    try {
      partIndexRef.current += 1
      const partNo = partIndexRef.current
      const key = `sessions/${currentSessionId}/part-${String(partNo).padStart(5, "0")}.webm`

      const blob = new Blob(chunkBufRef.current, { type: "audio/webm" })

      // presign + PUT do chunk
      const { url } = await getPresignedPutForKey(key) // a rota deve ser /api/recordings/presign
      const resp = await fetch(url, { method: "PUT", body: blob })
      if (!resp.ok) throw new Error(`PUT failed: ${resp.status}`)

      // transcrever o chunk
      const stt = await transcribeChunk({
        key,
        sessionId: currentSessionId,
        part: partNo,
      })

      if (stt?.text) {
        setTranscript((prev) => (prev ? prev + " " : "") + stt.text)
        // opcional: alimentar suas notas/resumo
        setSummary((prev) => (prev ? prev + "\n" : "") + stt.text)
      }

      // reset buffer
      chunkBufRef.current = []
      chunkBytesRef.current = 0
    } catch (e) {
      console.error("flush5MBChunk failed:", e)
    } finally {
      flushingRef.current = false
    }
  }

  const { start, stop, isRecording, recordingTime, error } = useAudioRecorder({
    mimeType: "audio/webm;codecs=opus",
    timeslice: 1500,
    onChunk: async (piece) => {
      // acumula até ~5MB
      chunkBufRef.current.push(piece)
      chunkBytesRef.current += piece.size
      if (sessionId && chunkBytesRef.current >= FIVE_MB) {
        await flush5MBChunk(sessionId)
      }
    },
    // sem onStop => não seguramos áudio completo em RAM
  })

  const startRecording = async () => {
    if (bootingRef.current) return
    bootingRef.current = true
    try {
      // garante sessionId e zera estado local
      const s = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Date.now()}`
      setSessionId(s)

      partIndexRef.current = 0
      chunkBufRef.current = []
      chunkBytesRef.current = 0
      // setTranscript("")

      await start()
    } finally {
      bootingRef.current = false
    }
  }

  const stopRecording = async () => {
    stop()
    if (!sessionId) return
    // manda o restinho < 5MB
    await flush5MBChunk(sessionId)
  }

  // ====== UI helpers ======
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `consulta-${(patientName || "paciente").replace(/\s+/g, "-")}-${consultationDate}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

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
      crp: currentUser?.crp || "",
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

  return (
    <div className="min-h-screen bg-background py-2">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="flex items-center space-x-2"
                      disabled={bootingRef.current}
                    >
                      {isRecording ? <MicOff /> : <Mic />}
                      <span>{isRecording ? "Parar Gravação" : "Iniciar Gravação"}</span>
                    </Button>

                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                        <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  {audioBlob && (
                    <Button onClick={downloadAudio} variant="outline" size="sm" className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download Áudio</span>
                    </Button>
                  )}
                </div>

                {/* feedback de erro do gravador */}
                {error && <p className="text-sm text-destructive mt-3">{error}</p>}
              </CardContent>
            </Card>

            {/* Transcript (preview) */}
            {transcript && (
              <div className="space-y-2">
                <Label>Transcrição parcial</Label>
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

            {/* Ações */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
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
              <Button onClick={saveConsultation} className="flex items-center space-x-2" size="lg">
                <Save className="w-4 h-4" />
                <span>Salvar Consulta</span>
              </Button>
            </div>
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
