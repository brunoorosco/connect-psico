"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { CertificateType } from "@components/settings/atestado/types"

export type CertificateConfig = any

export type TemplateItem = {
  id: string | number
  name?: string
  type: CertificateType
  configJson: CertificateConfig
}

// =====================
// PROPS DO COMPONENTE
// =====================
export type IssueDocumentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  // Dados / opções
  templates: TemplateItem[]
  templatesLoading?: boolean

  // Controle de tipo de documento
  docType: CertificateType
  onDocTypeChange: (type: CertificateType) => void

  // Campos controlados pelo pai
  rg: string
  onChangeRg: (v: string) => void
  cpf: string
  onChangeCpf: (v: string) => void
  sintomas: string
  onChangeSintomas: (v: string) => void
  cid: string
  onChangeCid: (v: string) => void
  days: number
  onChangeDays: (v: number) => void
  consultationTime: string
  onChangeConsultationTime: (v: string) => void

  // Ação principal
  onGenerate: () => Promise<void> | void

  // Estado de desabilitar botão
  canGenerate?: boolean
}

export default function IssueDocumentDialog(props: IssueDocumentDialogProps) {
  const {
    open,
    onOpenChange,
    templates,
    templatesLoading = false,
    docType,
    onDocTypeChange,
    rg,
    onChangeRg,
    cpf,
    onChangeCpf,
    sintomas,
    onChangeSintomas,
    cid,
    onChangeCid,
    days,
    onChangeDays,
    consultationTime,
    onChangeConsultationTime,
    onGenerate,
    canGenerate = true,
  } = props

  const hasTemplates = templates?.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Emitir documento</DialogTitle>
          <DialogDescription>Preencha os dados para gerar o PDF do documento.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Tipo */}
          <div className="grid gap-1">
            <Label>Tipo</Label>
            <div className="col-span-3">
              <Select
                value={docType}
                onValueChange={(v) => onDocTypeChange(v as CertificateType)}
                disabled={templatesLoading || !hasTemplates}
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
                  onChange={(e) => onChangeRg(e.currentTarget.value)}
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
                  onChange={(e) => onChangeCpf(e.currentTarget.value)}
                  placeholder="Ex.: 123.456.789-00"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="sintomas">Sintomas/Avaliação</Label>
            <div className="col-span-3">
              <Input
                id="sintomas"
                value={sintomas}
                onChange={(e) => onChangeSintomas(e.currentTarget.value)}
                placeholder="Sintomas/Avaliação"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* CID */}
            <div className="grid gap-1">
              <Label htmlFor="cid">CID</Label>
              <Input id="cid" value={cid} onChange={(e) => onChangeCid(e.currentTarget.value)} placeholder="Ex.: F41" />
            </div>

            {/* Dias */}
            <div className="grid gap-1">
              <Label htmlFor="dias">Dias</Label>
              <div className="col-span-3">
                <Input
                  id="dias"
                  type="number"
                  min={0}
                  value={Number.isFinite(days) ? days : 0}
                  onChange={(e) => onChangeDays(e.currentTarget.valueAsNumber || 0)}
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
                  value={consultationTime}
                  onChange={(e) => onChangeConsultationTime(e.currentTarget.value)}
                  placeholder="Ex.: 08:00"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 grid grid-cols-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onGenerate} disabled={!canGenerate || templatesLoading || !hasTemplates}>
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
