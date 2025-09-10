"use client";

import { CertificateConfig, CertificateType } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import ColorField from "./ColorField";
import ModelFont from "./ModelFont";
import { templates, titles } from "./templates";
import TemplateHelp from "./TooltipHelp";


interface Props {
  config: CertificateConfig;
  onChange: <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => void;
}

export default function BodyConfig({ config, onChange }: Props) {
  // 1) NUNCA usar fallback aqui; mantém exatamente o que veio do pai
  const selectedType: CertificateType | undefined = config.type;

  // 2) Use um baseType SÓ para fallbacks de visualização (título/template)
  const baseType: CertificateType = selectedType ?? "atestado";

  const title =
    (config.bodyTitle && config.bodyTitle.trim().length > 0
      ? config.bodyTitle
      : titles[baseType]);

  const template =
    (config.bodyTemplate && config.bodyTemplate.trim().length > 0
      ? config.bodyTemplate
      : templates[baseType]) ?? "";

  return (
    <div className="space-y-3">
      {/* Select + Input lado a lado */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Tipo de Documento</Label>
          <Select
            // 3) Controlado pelo valor exato do estado
            value={selectedType ?? ""}              // quando undefined, usa ""
            onValueChange={(value) => {
              onChange("type", value as CertificateType);
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
            value={title}
            onChange={(e) => onChange("bodyTitle", e.currentTarget.value)}
          />
        </div>
      </div>
      <TemplateHelp/>

      {/* Área para edição do conteúdo */}
      <Textarea
        rows={15}
        value={template}
        onChange={(e) => onChange("bodyTemplate", e.currentTarget.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Cor do Texto"
          value={config.bodyTextColor}
          onChange={(v) => onChange("bodyTextColor", v)}
        />
        <div>
          <Label>Tamanho da Fonte (px)</Label>
          <Input
            type="number"
            min={10}
            max={32}
            value={config.bodyFontSize}
            onChange={(e) => onChange("bodyFontSize", e.currentTarget.valueAsNumber)}
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
            onChange={(e) => onChange("titleFontSize", e.currentTarget.valueAsNumber)}
          />
        </div>
        <ModelFont
          value={config.titleFontFamily}
          onChange={(v) => onChange("titleFontFamily", v)}
        />
      </div>
    </div>
  );
}
