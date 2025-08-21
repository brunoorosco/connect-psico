import { CertificateConfig, Align, Position } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import ColorField from "./ColorField"
import ModelFont from "./ModelFont"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void
}

export default function HeaderConfig({ config, onChange, onFile }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch checked={config.showHeader} onCheckedChange={(v) => onChange("showHeader", v)} />
        <Label>Mostrar Cabeçalho</Label>
      </div>
      {config.showHeader && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Altura</Label>
            <Input
              value={config.headerHeight}
              type="number"
              max={6}
              min={1}
              onChange={(e) => onChange("headerHeight", e.target.valueAsNumber)}
            />
          </div>
          <ColorField
            label="Cor de Fundo"
            value={config.headerBgColor}
            onChange={(v) => onChange("headerBgColor", v)}
            //   description="Copie/cole o hex (ex.: #FFFFFF) ou ajuste no seletor."
          />
          <div>
            <Label>Logo (PNG/JPG/SVG)</Label>
            <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "headerLogoUrl")} />
            {config.headerLogoUrl && (
              <button type="button" className="mt-2 text-sm underline" onClick={() => onChange("headerLogoUrl", "")}>
                Remover Logo
              </button>
            )}
          </div>

          <ColorField
            label="Cor do Texto"
            value={config.headerTextColor}
            onChange={(v) => onChange("headerTextColor", v)}
            //   description="Copie/cole o hex (ex.: #FFFFFF) ou ajuste no seletor."
          />
          <div className="col-span-2">
            <Label>Texto</Label>
            <Input value={config.headerText} onChange={(e) => onChange("headerText", e.target.value)} />
          </div>
          {/* Tamanho da fonte (px/rem) */}
          <div>
            <Label>Tamanho da Fonte (px)</Label>
            <Input
              type="number"
              min={10}
              max={35}
              value={config.headerFontSize}
              onChange={(e) => onChange("headerFontSize", e.target.valueAsNumber)}
            />
          </div>

          {/* Modelos de fonte (5 fixos) */}
          <div className="col-span-1">
            <ModelFont value={config.headerFontFamily} onChange={(v) => onChange("headerFontFamily", v)} />
          </div>

          <div className="col-span-1">
            <Label>Alinhamento</Label>
            <Select value={config.headerAlign} onValueChange={(v) => onChange("headerAlign", v as Align)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Cima</SelectItem>
                <SelectItem value="middle">Meio</SelectItem>
                <SelectItem value="bottom">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label>Posição</Label>
            <Select value={config.headerPosition} onValueChange={(v) => onChange("headerPosition", v as Position)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
