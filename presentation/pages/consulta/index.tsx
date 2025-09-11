"use client"

import { useEffect, useMemo, useState, startTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PatientHeader } from "@components/consulta/PatientHeader"
import { ConsultationDateTimeEditor } from "@components/consulta/ConsultationDateTimeEditor"
import { ClinicalEvolution } from "@components/consulta/ClinicalEvolution"
// import { AiSummary } from "@components/consulta/AISummary"
// import { Prescription } from "@components/consulta/Prescription"
import { usePatientStore } from "@/infra/stores/usePatientStore"
import { ConsultaSkeleton } from "@components/skeletons"
import { getPatientByUserId } from "@/actions/patients/getPatientByUserId"
import { useConsultationForm } from "@/hooks/useConsultation"
import { useCurrentUser } from "@hooks/use-current-user"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import { generateCertificatePdf } from "@/infra/pdf/generateTemplatesPdf"
import { calcularIdade } from "@/utils/calcAge"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"

type CertificateType = "atestado" | "comparecimento" | "acompanhamento" | "encaminhamento" | "relatorio"
type CertificateConfig = any

type TemplateItem = {
  id: string | number
  name?: string
  type: CertificateType
  configJson: CertificateConfig
}

export const ConsultationStart = () => {
  const router = useRouter()
  const params = useParams()
  const { patientId, id } = params as { patientId: string; id: string }

  const setPatient = usePatientStore((state) => state.setPatient)
  const patient = usePatientStore((state) => state.patient)

  const [consultationDate, setConsultationDate] = useState(new Date())
  const [consultationTime, setConsultationTime] = useState("14:00")
  const [isEditingDateTime, setIsEditingDateTime] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clinicalEvolution, setClinicalEvolution] = useState("")
  const [prescription, setPrescription] = useState("")
  
  const { form, handleSubmit } = useConsultationForm({})
  
  const currentUser = useCurrentUser()
  const [canIssueDocument, setCanIssueDocument] = useState(true)
  const [issueOpen, setIssueOpen] = useState(false)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  
  // form modal
  const [docType, setDocType] = useState<CertificateType>("atestado")
  const [cid, setCid] = useState<string>("")
  const [days, setDays] = useState<number>(3)
  const [timeStr, setTimeStr] = useState<string>("08:00")
  // NEW: RG e CPF na modal, com preenchimento automático
  const [rg, setRg] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [sintomas, setSintomas] = useState("")

  // Buscar paciente
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

  const selectedConfig = useMemo<CertificateConfig | undefined>(() => {
    return docType ? configByType[docType] : undefined
  }, [docType, configByType])

  async function openIssueModal() {
    if (!templates.length) await loadTemplates()
    if (consultationTime) setTimeStr(consultationTime)
    // Pré-preenche RG/CPF se existirem no paciente
    if (patient?.rg) setRg(patient.rg)
    if (patient?.cpf) setCpf(patient.cpf)
    setIssueOpen(true)
  }

  // idade segura (não quebra a página)
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
      data: new Date().toLocaleDateString("pt-BR"),
      horario: timeStr || "08:00",
      cid: cid || "",
      sintomas: sintomas || "",
      dias: days || 0,
      dataExtenso: format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    }
  }, [patient?.name, rg, cpf, idade, timeStr, cid, days])

  async function handleEmitDocument() {
    if (!selectedConfig) return
    const userForDoc = {
      name: currentUser?.name || "Profissional",
      crp: currentUser?.crp || "",
    }
    await generateCertificatePdf(selectedConfig, userForDoc, patientDataForDoc)
    setIssueOpen(false)
  }

  const handleFinishConsultation = async () => {
    setIsSubmitting(true)
    try {
      await handleSubmit({
        notes: clinicalEvolution,
        prescription,
        patientId: patient?.id ?? 0,
        professionalId: id,
      })
      setCanIssueDocument(true)
    } catch (error) {
      console.error("Erro ao finalizar consulta:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) return <ConsultaSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="mr-2">
            <span className="mr-1">←</span>Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Consulta em Andamento</h1>
        </div>

        <Card className="mb-6 border-l-4 border-therapy-primary p-4">
          <PatientHeader
            name={patient?.name ?? ""}
            date={consultationDate}
            time={consultationTime}
            isEditing={isEditingDateTime}
            onEditToggle={() => setIsEditingDateTime(true)}
          />
          {isEditingDateTime && (
            <div className="mt-4">
              <ConsultationDateTimeEditor
                date={consultationDate}
                time={consultationTime}
                onChangeDate={setConsultationDate}
                onChangeTime={(t) => {
                  setConsultationTime(t)
                  setTimeStr(t)
                }}
                onConfirm={() => setIsEditingDateTime(false)}
              />
            </div>
          )}
        </Card>

        {/* <AiSummary /> */}
        <ClinicalEvolution value={clinicalEvolution} onChange={setClinicalEvolution} />
        {/* <Prescription value={prescription} onChange={setPrescription} /> */}

        <div className="flex justify-end mt-4 gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            onClick={handleFinishConsultation}
            disabled={!clinicalEvolution || isSubmitting}
            className="bg-therapy-primary hover:bg-therapy-tertiary transition-colors"
          >
            {isSubmitting ? "Salvando..." : "Finalizar Consulta"}
          </Button>

          <Button
            variant="secondary"
            disabled={!canIssueDocument}
            onClick={openIssueModal}
            className="ml-2"
            title={!canIssueDocument ? "Finalize a consulta para emitir o documento" : "Emitir documento"}
          >
            Emitir documento
          </Button>
        </div>
      </div>

      {/* Modal de emissão */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir documento</DialogTitle>
            <DialogDescription>Preencha os dados para gerar o PDF do documento.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Tipo */}
            <div className="grid gap-1">
              <Label className="">Tipo</Label>
              <div className="col-span-3">
                <Select
                  value={docType}
                  onValueChange={(v) => setDocType(v as CertificateType)}
                  disabled={templatesLoading || templates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={templatesLoading ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.type}>
                        {t.name || t.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* RG */}
              <div className="grid gap-1">
                <Label htmlFor="rg">RG</Label>
                <div className="col-span-3">
                  <Input
                    id="rg"
                    value={rg}
                    onChange={(e) => setRg(e.currentTarget.value)}
                    placeholder="Ex.: 12.345.678-9"
                  />
                </div>
              </div>

              {/* CPF */}
              <div className="grid gap-1">
                <Label htmlFor="cpf">CPF</Label>
                <div className="col-span-3">
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(e.currentTarget.value)}
                    placeholder="Ex.: 123.456.789-00"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="cpf" className="">
                Sintomas/Avaliação
              </Label>
              <div className="col-span-3">
                <Input
                  id="sintomas"
                  value={sintomas}
                  onChange={(e) => setSintomas(e.currentTarget.value)}
                  placeholder="Sintomas/Avaliação"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* CID */}
              <div className="grid gap-1">
                <Label htmlFor="cid">CID</Label>
                <Input id="cid" value={cid} onChange={(e) => setCid(e.currentTarget.value)} placeholder="Ex.: F41" />
              </div>

              {/* Dias */}
              <div className="grid gap-1">
                <Label htmlFor="dias">Dias</Label>
                <div className="col-span-3">
                  <Input
                    id="dias"
                    type="number"
                    min={0}
                    value={days}
                    onChange={(e) => setDays(e.currentTarget.valueAsNumber || 0)}
                    placeholder="Ex.: 3"
                  />
                </div>
              </div>

              {/* Horário */}
              <div className="grid gap-1">
                <Label htmlFor="horario">Horário</Label>
                <div className="col-span-3">
                  <Input
                    id="horario"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.currentTarget.value)}
                    placeholder="Ex.: 08:00"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIssueOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEmitDocument}
              disabled={!selectedConfig || templatesLoading}
              className="bg-therapy-primary hover:bg-therapy-tertiary"
            >
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConsultationStart
