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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Cor de Fundo"
          value={config.backgroundColor}
          onChange={(v) => onChange("backgroundColor", v)}
        //   description="Copie/cole o hex (ex.: #FFFFFF) ou ajuste no seletor."
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

        <div className="col-span-2">
          <Label>Imagem de Fundo (PNG/JPG/SVG)</Label>
          <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "backgroundImage")} />
          {config.backgroundImage && (
            <button type="button" className="mt-2 text-sm underline" onClick={() => onChange("backgroundImage", "")}>
              Remover imagem de fundo
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Marca d’água</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Imagem (PNG/JPG/SVG)</Label>
            <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "watermarkUrl")} />
            {config.watermarkUrl && (
              <button type="button" className="mt-2 text-sm underline" onClick={() => onChange("watermarkUrl", "")}>
                Remover marca d’água
              </button>
            )}
          </div>

          <div>
            <Label>Opacidade (0 a 1)</Label>
            <Input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={config.watermarkOpacity}
              onChange={(e) => onChange("watermarkOpacity", Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Largura (%)</Label>
            <Input
              type="number"
              min="10"
              max="100"
              value={config.watermarkWidthPct ?? 60}
              onChange={(e) => onChange("watermarkWidthPct", Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Posição Top (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={config.watermarkTopPct ?? 30}
              onChange={(e) => onChange("watermarkTopPct", Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Posição Left (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={config.watermarkLeftPct ?? 50}
              onChange={(e) => onChange("watermarkLeftPct", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
