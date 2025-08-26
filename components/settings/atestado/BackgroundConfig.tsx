import { CertificateConfig } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ColorField from "./ColorField"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void
}

export default function BackgroundConfig({ config, onChange, onFile }: Props) {
  return (
    <div className="border grid grid-cols-2 gap-3">
      <ColorField
        label="Cor de Fundo"
        value={config.backgroundColor}
        onChange={(v) => onChange("backgroundColor", v)}
      />

      <div>
        <Label>Opacidade do Fundo (0 a 1)</Label>
        <Input
          type="number"
          step="0.05"
          min="0"
          max="1"
          value={config.backgroundOpacity}
          onChange={(e) => onChange("backgroundOpacity", Number(e.target.value))}
        />
      </div>
    </div>
  )
}
