import { CertificateConfig } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ColorField from "./ColorField"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
}

export default function BodyConfig({ config, onChange }: Props) {
  return (
    <div className="space-y-3">
      {/* <Label>Modelo (Mustache: {{nome}}, etc.)</Label> */}
      <Textarea rows={6} value={config.bodyTemplate} onChange={(e) => onChange("bodyTemplate", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Cor do Texto"
          value={config.bodyTextColor}
          onChange={(v) => onChange("bodyTextColor", v)}
          //   description="Copie/cole o hex (ex.: #FFFFFF) ou ajuste no seletor."
        />
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
    </div>
  )
}
