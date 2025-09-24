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
// import { TemplateItem } from "@services/templates"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { generateCertificatePdf } from "@/infra/pdf/generateTemplatesPdf"
import { useAudioRecorder } from "@hooks/useAudioRecorder"
import { finalizeRecordingRequest, uploadChunk } from "@services/consultationService"
import IssueDocumentDialog from "@components/consulta/ModalTemplateGenerator"

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
  const [patientName, setPatientName] = useState("Nome Paciente")
  const [consultationDate, setConsultationDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [consultationTime, setConsultationTime] = useState(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [canIssueDocument, setCanIssueDocument] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { form, handleSubmit } = useConsultationForm({})
  const [isChecking, setIsChecking] = useState(true)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [docType, setDocType] = useState<CertificateType>("atestado")
  const [cid, setCid] = useState<string>("")
  const [days, setDays] = useState<number>(3)
  // NEW: RG e CPF na modal, com preenchimento automático
  const [rg, setRg] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [sintomas, setSintomas] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const setPatient = usePatientStore((state) => state.setPatient)
  const patient = usePatientStore((state) => state.patient)

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

  const { start, stop, isRecording, recordingTime } = useAudioRecorder(async (chunk: Blob) => {
    // envia cada chunk para a API com o sessionId
    if (!sessionId) return
    try {
      await uploadChunk(sessionId, chunk)
    } catch (err) {
      console.error("upload chunk failed", err)
    }
  })

  const startRecording = async () => {
    const s = crypto.randomUUID?.() ?? `s-${Date.now()}`
    setSessionId(s)
    await start()
  }

  const stopRecording = async () => {
    stop()
    if (!sessionId) return
    try {
      const res = await finalizeRecordingRequest(sessionId)
      if (res?.summary) {
        setSummary(res.summary)
        // opcional: preenche notas automaticamente
        // setNotes(prev => prev + "\n\nResumo automático:\n" + res.summary)
      }
    } catch (err) {
      console.error("finalize failed", err)
    }
  }

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

  // Carregar templates ao abrir a modal
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
    for (const it of templates) {
      map[it.type] = it.configJson
    }
    return map
  }, [templates])

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `consulta-${patientName.replace(" ", "-")}-${consultationDate}.wav`
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
    // Pré-preenche RG/CPF se existirem no paciente
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
            {/* Informações do Paciente e Consulta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="patient-name">Nome do Paciente</Label>
                <Input
                  id="patient-name"
                  value={patient?.name}
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

            {/* Controles de Gravação */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="flex items-center space-x-2"
                    >
                      {isRecording ? <MicOff /> : <Mic />}
                      <span>{isRecording ? "Parar Gravação" : "Iniciar Gravação"}</span>
                    </Button>

                    {isRecording && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
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
              </CardContent>
            </Card>

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

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <Button
                // onClick={generateDeclaration}
                onClick={openIssueModal}
                // disabled={!canIssueDocument}
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
