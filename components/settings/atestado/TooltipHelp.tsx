// components/TemplateHelp.tsx
"use client"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function TemplateHelp() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Ajuda do template"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs leading-none"
          >
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[360px] whitespace-pre-wrap text-sm">
          {`Use variáveis: {{paciente}}, {{rg}}, {{cpf}}, {{idade}}, {{data}}, {{dataExtenso}}, {{horario}}, {{cid}}, {{dias}}, {{modalidade}}, {{queixa}}, {{tratamento}}, {{observacoes}}, {{medico}}, {{crp}}.

Dicas:
• Apenas {{var}} simples (sem condicionais/loops).
• Quebras de linha criam parágrafos.
• Exemplo:

Declaro que {{paciente}}, RG {{rg}}, esteve presente em atendimento psicológico.

CID: {{cid}}
Dia {{data}} às {{horario}}

São Paulo, {{dataExtenso}}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
