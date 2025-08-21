import { CertificateConfig, Align } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
  config: CertificateConfig;
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void;
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void;
}

export default function FooterConfig({ config, onChange, onFile }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch checked={config.showFooter} onCheckedChange={(v) => onChange("showFooter", v)} />
        <Label>Mostrar Rodapé</Label>
      </div>
      {config.showFooter && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Altura (ex: 4cm)</Label>
            <Input value={config.footerHeight} onChange={(e) => onChange("footerHeight", e.target.value)} />
          </div>
          <div>
            <Label>Cor de Fundo</Label>
            <Input type="color" value={config.footerBgColor} onChange={(e) => onChange("footerBgColor", e.target.value)} />
          </div>
          <div>
            <Label>Logo (PNG/JPG/SVG)</Label>
            <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "footerLogoUrl")} />
          </div>
          <div>
            <Label>Cor do Texto</Label>
            <Input type="color" value={config.footerTextColor} onChange={(e) => onChange("footerTextColor", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Texto</Label>
            <Input value={config.footerText} onChange={(e) => onChange("footerText", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Alinhamento</Label>
            <Select value={config.footerAlign} onValueChange={(v) => onChange("footerAlign", v as Align)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-2">
            <Label>Empresa (Nome / Endereço / Telefone)</Label>
            <Input placeholder="Nome" value={config.companyName} onChange={(e) => onChange("companyName", e.target.value)} />
            <Input placeholder="Endereço" value={config.companyAddress} onChange={(e) => onChange("companyAddress", e.target.value)} />
            <Input placeholder="Telefone" value={config.companyPhone} onChange={(e) => onChange("companyPhone", e.target.value)} />
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <Switch checked={config.qrCodeEnabled} onCheckedChange={(v) => onChange("qrCodeEnabled", v)} />
            <Label>Incluir QR Code</Label>
          </div>
          {config.qrCodeEnabled && (
            <div className="col-span-2">
              <Label>Conteúdo do QR</Label>
              <Input value={config.qrCodeValue} onChange={(e) => onChange("qrCodeValue", e.target.value)} placeholder="URL ou texto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
