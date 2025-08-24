"use client"

import { CertificateConfig } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColorField from "./ColorField"
import ModelFont from "./ModelFont"
import { templates, titles } from "./templates"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
}

export default function BodyConfig({ config, onChange }: Props) {
  const type = config.type ?? "atestado"
  const currentTemplate = config.bodyTemplates?.[type] ?? templates[type] ?? ""
  const currentTitle = config.bodyTitles?.[type] ?? titles[type] ?? ""
  
  return (
    <div className="space-y-3">
      {/* Select + Input lado a lado */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Tipo de Documento</Label>
          <Select
            defaultValue={type}
            onValueChange={(value) => {
              onChange("type", value as any)
            }}
          >
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
          <Input
            type="text"
            value={currentTitle}
            onChange={(e) =>
              onChange("bodyTitles", {
                ...config.bodyTitles,
                [type]: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Área para edição do conteúdo */}
      <Textarea
        rows={15}
        value={currentTemplate}
        onChange={(e) =>
          onChange("bodyTemplates", {
            ...config.bodyTemplates,
            [type]: e.target.value,
          })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Cor do Texto" value={config.bodyTextColor} onChange={(v) => onChange("bodyTextColor", v)} />
        <div>
          <Label>Tamanho da Fonte (px)</Label>
          <Input
            type="number"
            min={10}
            max={32}
            value={config.bodyFontSize}
            onChange={(e) => onChange("bodyFontSize", e.target.valueAsNumber)}
          />
        </div>
      </div>

      {/* Configurações do título */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tamanho do Título (px)</Label>
          <Input
            type="number"
            min={12}
            max={60}
            value={config.titleFontSize}
            onChange={(e) => onChange("titleFontSize", e.target.valueAsNumber)}
          />
        </div>
        <ModelFont value={config.titleFontFamily} onChange={(v) => onChange("titleFontFamily", v)} />
      </div>
    </div>
  )
}
