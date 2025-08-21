import { CertificateConfig } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ColorField from "./ColorField"
import ModelFont from "./ModelFont"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
}

export default function BodyConfig({ config, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Textarea rows={6} value={config.bodyTemplate} onChange={(e) => onChange("bodyTemplate", e.target.value)} />

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
