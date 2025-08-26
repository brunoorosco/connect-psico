import { CertificateConfig } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import ColorField from "./ColorField"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void
}

export default function HeaderConfig({ config, onChange, onFile }: Props) {
  return (
    <div className="grid-cols-2 grid gap-4">
      <div className="col-span-1">
        <div className="flex items-center gap-3">
          <Switch checked={config.showHeader} onCheckedChange={(v) => onChange("showHeader", v)} />
          <Label>Mostrar Cabeçalho</Label>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Altura</Label>
            <Input
              disabled={!config.showHeader}
              value={config.headerHeight}
              type="number"
              step={0.1}
              max={6}
              min={1}
              onChange={(e) => onChange("headerHeight", e.target.valueAsNumber)}
            />
          </div>
          <ColorField
            disabled={!config.showHeader}
            label="Cor de Fundo"
            value={config.headerBgColor}
            onChange={(v) => onChange("headerBgColor", v)}
          />
        </div>
      </div>

      <div className="col-span-1">
        <div className="flex items-center gap-3">
          <Switch checked={config.showFooter} onCheckedChange={(v) => onChange("showFooter", v)} />
          <Label>Mostrar Rodapé</Label>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Altura (cm)</Label>
            <Input
              disabled={!config.showFooter}
              value={config.footerHeight}
              type="number"
              min={1}
              max={6}
              step={0.1}
              onChange={(e) => onChange("footerHeight", e.target.valueAsNumber)}
            />
          </div>

          <div>
            <ColorField
              disabled={!config.showFooter}
              label="Cor de Fundo"
              value={config.footerBgColor}
              onChange={(v) => onChange("footerBgColor", v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
