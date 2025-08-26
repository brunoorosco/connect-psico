import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Mustache from "mustache"

import { CertificateConfig, CertificateType } from "./types"
import { headerFontStacks } from "./constants"
import { templates, titles } from "./templates"
import DraggableLayer, { type AnyLayer, type QrLayer } from "./DraggableLayer"

interface Props {
  config: CertificateConfig & { layers?: AnyLayer[] }
  user?: { name?: string; crp?: string }
  editing?: boolean
  onLayerChange?: (id: string, patch: Partial<AnyLayer>) => void
}

export default function CertificatePreview({ config, user, editing = false, onLayerChange }: Props) {
  const type: CertificateType = config?.type || "atestado"
  const title = (config.bodyTitle?.trim()?.length ? config.bodyTitle : titles[type]) ?? ""
  const template = (config.bodyTemplate?.trim()?.length ? config.bodyTemplate : templates[type]) ?? ""
  const dataExtenso = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  function safeTemplate(template: string) {
    // Substitui aberturas ou fechamentos soltos por texto literal
    return template.replace(/{{(?!\s*[\w\.]+\s*}})/g, "&#123;&#123;").replace(/(?<!{{\s*[\w\.]+\s*)}}/g, "&#125;&#125;")
  }

  const safe = safeTemplate(template)

  const renderedBody = Mustache.render(safe, {
    medico: user?.name ?? "",
    crm: user?.crp ?? "",
    paciente: "Nome do Paciente",
    rg: "000000000-0",
    data: format(new Date(), "dd/MM/yyyy", { locale: ptBR }),
    dataExtenso,
    dias: 3,
    inicio: "04/2022",
    horario: "08:00hrs",
    sintomas: "ansiedade intensa, humor deprimido",
    cid: "F41",
    cpf: "000.000.000-00",
    idade: 30,
    modalidade: "online",
    queixa: "crises de ansiedade",
    tratamento: "crises de ansiedade",
    observacoes: "relatou alteração de sono e humor",
  }).replaceAll("&#x2F;", "/")

  function hexToRgba(hex: string) {
    const m8 = /^#([0-9A-F]{8})$/i.exec(hex)
    const m6 = /^#([0-9A-F]{6})$/i.exec(hex)
    if (m8) {
      const r = parseInt(m8[1].slice(0, 2), 16)
      const g = parseInt(m8[1].slice(2, 4), 16)
      const b = parseInt(m8[1].slice(4, 6), 16)
      const a = parseInt(m8[1].slice(6, 8), 16) / 255
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    if (m6) return hex // #RRGGBB normal
    return hex
  }

  function cmToPx(cm: number) {
    return Math.round((cm * 96) / 2.54) // 96 dpi
  }

  return (
    <div
      id="certificate"
      className="relative border rounded-md bg-white mx-auto w-full max-w-xl aspect-[148/210] overflow-hidden print:shadow-none"
      data-size={config.paperSize}
    >
      {/* Fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: hexToRgba(config.backgroundColor),
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: config.backgroundOpacity,
          zIndex: 0,
        }}
      />

      {/* Header */}
      {config.showHeader && (
        <div
          className="absolute left-0 top-0 w-full h-full flex flex-col z-10"
          style={{
            height: `${config.headerHeight}cm`,
            background: hexToRgba(config.headerBgColor),
          }}
        ></div>
      )}

      {/* Footer */}
      {config.showFooter && (
        <div
          className="absolute left-0 w-full px-8 flex flex-col justify-center z-10" // ⬅️ tiramos items-center
          style={{
            bottom: 0,
            height: `${config.footerHeight}cm`,
            background: hexToRgba(config.footerBgColor),
          }}
        ></div>
      )}

      {/* Layers (texto/imagem/QR) */}
      {Array.isArray(config.layers) && config.layers.length > 0 && (
        <div id="layers" className={`absolute inset-0 z-50 ${editing ? "pointer-events-auto" : "pointer-events-none"}`}>
          {config.layers.map((layer) => (
            <DraggableLayer
              key={layer.id}
              layer={layer}
              boundsSelector="#certificate"
              editable={editing}
              onChange={(patch) => onLayerChange?.(layer.id, patch)}
              renderQr={(qr: QrLayer) => {
                // Render simples do QR (pode trocar por lib local)
                const size = Math.max(64, Math.round(Math.min(qr.w ?? 128, qr.h ?? 128)))
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
                  qr.value
                )}&color=${(qr.fg ?? "#000000").replace("#", "")}&bgcolor=${(qr.bg ?? "#FFFFFF").replace("#", "")}`
                return <img src={url} alt="QR" className="w-full h-full pointer-events-none" draggable={false} />
              }}
            />
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div
        className="relative z-10 px-8"
        style={{
          paddingTop: `calc(${config.showHeader ? `${config.headerHeight}cm` : "0px"} + 16px)`,
          paddingBottom: `calc(${config.showFooter ? `${config.footerHeight}cm` : "0px"} + 16px)`,
          color: config.bodyTextColor,
          fontSize: `${config.bodyFontSize}px`,
          fontFamily: headerFontStacks[config.titleFontFamily] ?? "serif",
        }}
      >
        <div
          className="text-center mb-4"
          style={{
            fontSize: `${config.titleFontSize}px`,
            fontWeight: "",
          }}
        >
          {title}
        </div>
        <div className="space-y-4 mb-6 whitespace-pre-wrap text-justify">{renderedBody}</div>
        <div className="text-right mt-6">
          {/* <p>{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p> */}
          <p className="mt-2">____________________________________</p>
          <p className="mt-1">{user?.name || "Médico(a)"}</p>
          <p>CRP: {user?.crp}</p>
        </div>
      </div>
    </div>
  )
}
