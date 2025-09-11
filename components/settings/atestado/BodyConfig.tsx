"use client"

import { CertificateConfig, CertificateType } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColorField from "./ColorField"
import ModelFont from "./ModelFont"
import { templates, titles } from "./templates"
import TemplateHelp from "./TooltipHelp"

type DateAlign = "left" | "center" | "right"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
}

export default function BodyConfig({ config, onChange }: Props) {
  // Mantém exatamente o que veio do pai (sem fallback no state)
  const selectedType: CertificateType | undefined = config.type

  // Fallbacks apenas para VISUALIZAÇÃO de título/template
  const baseType: CertificateType = selectedType ?? "atestado"
  const title = (config.bodyTitle?.trim()?.length ?? 0) > 0 ? (config.bodyTitle as string) : titles[baseType]
  const template =
    (config.bodyTemplate?.trim()?.length ?? 0) > 0 ? (config.bodyTemplate as string) : templates[baseType]

  const bodyCityDate = (config as any).bodyCityDate.trim()

  const bodyDateAlign = (config as any).bodyDateAlign ? (config as any).bodyDateAlign : "left"

  const bodyFontSize = Number.isFinite(config.bodyFontSize) ? (config.bodyFontSize as number) : 14
  const titleFontSize = Number.isFinite(config.titleFontSize) ? (config.titleFontSize as number) : 26

  return (
    <div className="space-y-3">
      {/* Tipo + Título */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Tipo de Documento</Label>
          <Select value={selectedType ?? ""} onValueChange={(value) => onChange("type", value as CertificateType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atestado">Atestado</SelectItem>
              <SelectItem value="comparecimento">Declaração de Comparecimento</SelectItem>
              <SelectItem value="acompanhamento">Declaração de Acompanhamento</SelectItem>
              <SelectItem value="encaminhamento">Encaminhamento</SelectItem>
              <SelectItem value="relatorio">Relatório Psicológico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Título do Documento</Label>
          <Input type="text" value={title} onChange={(e) => onChange("bodyTitle", e.currentTarget.value as any)} />
        </div>
      </div>

      <TemplateHelp />

      {/* Template */}
      <Textarea rows={12} value={template} onChange={(e) => onChange("bodyTemplate", e.currentTarget.value as any)} />

      {/* Cidade + Alinhamento da data + Cor do texto */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Cidade</Label>
          <Input
            type="text"
            value={bodyCityDate}
            onChange={(e) => onChange("bodyCityDate" as any, e.currentTarget.value as any)}
          />
        </div>

        <div>
          <Label>Alinhamento da data</Label>
          <Select
            value={(bodyDateAlign as DateAlign) ?? "left"}
            onValueChange={(val) => onChange("bodyDateAlign" as any, val as any)} // <— atualiza o config
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o alinhamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ColorField
          label="Cor do Texto"
          value={config.bodyTextColor}
          onChange={(v) => onChange("bodyTextColor", v as any)}
        />
      </div>

      {/* Tipografia */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Tamanho da Fonte (px)</Label>
          <Input
            type="number"
            min={10}
            max={32}
            value={bodyFontSize}
            onChange={(e) => onChange("bodyFontSize", e.currentTarget.valueAsNumber as any)}
          />
        </div>

        <div>
          <Label>Tamanho do Título (px)</Label>
          <Input
            type="number"
            min={12}
            max={60}
            value={titleFontSize}
            onChange={(e) => onChange("titleFontSize", e.currentTarget.valueAsNumber as any)}
          />
        </div>

        <div>
          <ModelFont value={config.titleFontFamily} onChange={(v) => onChange("titleFontFamily", v as any)} />
        </div>
      </div>
    </div>
  )
}
