import { CertificateConfig, Align } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  config: CertificateConfig;
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void;
  onFile: (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => void;
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
            <Label>Altura (ex: 4cm)</Label>
            <Input value={config.headerHeight} onChange={(e) => onChange("headerHeight", e.target.value)} />
          </div>
          <div>
            <Label>Cor de Fundo</Label>
            <Input type="color" value={config.headerBgColor} onChange={(e) => onChange("headerBgColor", e.target.value)} />
          </div>
          <div>
            <Label>Logo (PNG/JPG/SVG)</Label>
            <Input type="file" accept="image/*,.svg" onChange={(e) => onFile(e, "headerLogoUrl")} />
          </div>
          <div>
            <Label>Cor do Texto</Label>
            <Input type="color" value={config.headerTextColor} onChange={(e) => onChange("headerTextColor", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Texto</Label>
            <Input value={config.headerText} onChange={(e) => onChange("headerText", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Alinhamento</Label>
            <Select value={config.headerAlign} onValueChange={(v) => onChange("headerAlign", v as Align)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
  );
}
