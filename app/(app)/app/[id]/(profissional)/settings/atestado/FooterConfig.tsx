import { CertificateConfig, Align, Position } from "./types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import ColorField from "./ColorField"
import ModelFont from "./ModelFont"

interface Props {
  config: CertificateConfig
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void
}

export default function FooterConfig({ config, onChange, onFile }: Props) {
  return (
    <div className="space-y-3">
      {/* Switch principal */}
      <div className="flex items-center gap-3">
        <Switch checked={config.showFooter} onCheckedChange={(v) => onChange("showFooter", v)} />
        <Label>Mostrar Rodapé</Label>
      </div>

      {config.showFooter && (
        <div className="grid grid-cols-4 gap-4">
          {/* Linha 1 */}
          <div>
            <Label>Altura (cm)</Label>
            <Input
              value={config.footerHeight}
              type="number"
              min={1}
              max={6}
              step={0.1}
              onChange={(e) => onChange("footerHeight", e.target.valueAsNumber)}
            />
          </div>

          <div>
            <Label>Alinhamento (vertical)</Label>
            <Select value={config.footerAlign} onValueChange={(v) => onChange("footerAlign", v as Align)}>
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

          <div>
            <Label>Posição (horizontal)</Label>
            <Select value={config.footerPosition} onValueChange={(v) => onChange("footerPosition", v as Position)}>
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

          <div>
            <Label>Tamanho da Fonte (px)</Label>
            <Input
              type="number"
              min={10}
              max={32}
              value={(config as any).footerFontSize ?? 14}
              onChange={(e) => onChange("footerFontSize" as any, e.target.valueAsNumber)}
            />
          </div>

          {/* Linha 2 */}
          <div>
            <ColorField
              label="Cor do Texto"
              value={config.footerTextColor}
              onChange={(v) => onChange("footerTextColor", v)}
            />
          </div>

          <div>
            <ColorField
              label="Cor de Fundo"
              value={config.footerBgColor}
              onChange={(v) => onChange("footerBgColor", v)}
            />
          </div>

          <div className="col-span-2">
            <ModelFont
              value={(config as any).footerFontFamily}
              onChange={(v) => onChange("footerFontFamily" as any, v)}
            />
          </div>

          {/* Linha 3 */}
          <div className="col-span-2">
            <Label>Logo (PNG/JPG/SVG)</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "footerLogoUrl")} />
              {config.footerLogoUrl && (
                <button type="button" className="text-sm underline" onClick={() => onChange("footerLogoUrl", "")}>
                  Remover logo
                </button>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <Label>Texto</Label>
            <Input
              value={config.footerText}
              onChange={(e) => onChange("footerText", e.target.value)}
              placeholder="Texto do rodapé"
            />
          </div>

          {/* Linha 4 – Empresa */}
          <div className="col-span-4">
            <Label>Empresa</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <Input
                placeholder="Nome"
                value={config.companyName}
                onChange={(e) => onChange("companyName", e.target.value)}
              />
              <Input
                placeholder="Endereço"
                value={config.companyAddress}
                onChange={(e) => onChange("companyAddress", e.target.value)}
              />
              <Input
                placeholder="Telefone"
                value={config.companyPhone}
                onChange={(e) => onChange("companyPhone", e.target.value)}
              />
            </div>
          </div>

          {/* Linha 5 – QR Code */}
          <div className="col-span-4">
            {/* linha 1: switch */}
            <div className="flex items-center gap-3 mb-2">
              <Switch checked={config.qrCodeEnabled} onCheckedChange={(v) => onChange("qrCodeEnabled", v)} />
              <Label>Incluir QR Code</Label>
            </div>

            {/* linha 2: A A B C D */}
            {config.qrCodeEnabled && (
              <div className="grid grid-cols-4 gap-3">
                {/* A (col-span-2) */}
                <div className="col-span-2">
                  <Label>Conteúdo do QR</Label>
                  <Input
                    value={config.qrCodeValue}
                    onChange={(e) => onChange("qrCodeValue", e.target.value)}
                    placeholder="URL ou texto"
                  />
                </div>
                <div>
                  <Label>Tamanho (cm)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    step={0.1}
                    value={(config as any).qrCodeSizeCm}
                    onChange={(e) => onChange("qrCodeSizeCm" as any, e.target.valueAsNumber)}
                  />
                </div>
                <div>
                  <div>
                    <ColorField
                      label="Cor de Fundo"
                      value={config.qrCodeBgColor}
                      onChange={(v) => onChange("qrCodeBgColor", v)}
                    />
                  </div>

                  {/* C */}
                  <div>
                    <ColorField
                      label="Cor do QR Code"
                      value={config.qrCodeColor}
                      onChange={(v) => onChange("qrCodeColor", v)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
