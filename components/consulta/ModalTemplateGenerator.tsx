import { generateCertificatePdf } from "@/infra/pdf/generateTemplatesPdf"
import { calcularIdade } from "@/utils/calcAge"
import { CertificateType } from "@components/settings/atestado/types"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { TemplateItem } from "@services/templates"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo, useState } from "react"

type Props = {
  issueOpen: boolean
  setIssueOpen: (arg: boolean) => void
  professional: {
    name: string
    crp: string
  }
  patient: {
    name: string
    idade: string
    cpf: string
    rg: string
    birthDate: string
  }
}
type CertificateConfig = any

export default function ModalTemplateGenerator({ issueOpen, setIssueOpen, professional, patient }: Props) {
  const [docType, setDocType] = useState<CertificateType>("atestado")
  const [cid, setCid] = useState<string>("")
  const [days, setDays] = useState<number>(3)
  const [timeStr, setTimeStr] = useState<string>("08:00")
  // NEW: RG e CPF na modal, com preenchimento automático
  const [rg, setRg] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [sintomas, setSintomas] = useState("")
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)

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
      name: professional.name || "Profissional",
      crp: professional.crp || "",
    }
    await generateCertificatePdf(selectedConfig, userForDoc, patientDataForDoc)
    setIssueOpen(false)
  }

  return (
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
  )
}
