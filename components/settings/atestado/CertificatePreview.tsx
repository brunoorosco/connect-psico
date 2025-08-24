import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Mustache from "mustache"

import { CertificateConfig, CertificateType } from "./types"
import { alignItemsByPosition, headerFontStacks, justifyByAlign, selfByPosition } from "./constants"
import { templates, titles } from "./templates"

interface Props {
  config: CertificateConfig
  user?: { name?: string; crp?: string }
}

export default function CertificatePreview({ config, user }: Props) {
  const type: CertificateType = config?.type || "atestado";
  const title = (config.bodyTitle?.trim()?.length ? config.bodyTitle : titles[type]) ?? "";
  const template = (config.bodyTemplate?.trim()?.length ? config.bodyTemplate : templates[type]) ?? "";
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
          className="absolute left-0 w-full px-8 flex flex-col items-center justify-center z-10"
          style={{
            top: 0,
            height: `${config.headerHeight}cm`,
            background: hexToRgba(config.headerBgColor),
            color: config.headerTextColor,
            textAlign: config.headerPosition as any,
            justifyContent: justifyByAlign[config.headerAlign as "top" | "middle" | "bottom"],
            alignItems: alignItemsByPosition[config.headerPosition as "left" | "center" | "right"],
            fontFamily: (headerFontStacks as any)?.[config.headerFontFamily] ?? "inherit", // opcional
          }}
        >
          {config.headerLogoUrl && <img src={config.headerLogoUrl} className="max-h-16 object-contain my-1" />}
          {config.headerText && <p style={{ fontSize: `${config.headerFontSize}px` }}>{config.headerText}</p>}
        </div>
      )}

      {/* Footer */}
      {config.showFooter && (
        <div
          className="absolute left-0 w-full px-8 flex flex-col justify-center border-t z-10" // ⬅️ tiramos items-center
          style={{
            bottom: 0,
            height: `${config.footerHeight}cm`,
            background: hexToRgba(config.footerBgColor),
            color: config.footerTextColor,
            // eixo principal (vertical):
            justifyContent: justifyByAlign[config.footerAlign as "top" | "middle" | "bottom"],
            // eixo cruzado (horizontal):
            alignItems: alignItemsByPosition[config.footerPosition as "left" | "center" | "right"],
            fontFamily: (headerFontStacks as any)?.[config.footerFontFamily] ?? "inherit", // opcional
            textAlign: config.footerPosition as any, // ⬅️ antes usava footerAlign (errado)
          }}
        >
          {config.footerLogoUrl && <img src={config.footerLogoUrl} className="max-h-16 object-contain my-1" />}
          {config.footerText && <p className="text-sm">{config.footerText}</p>}

          {(config.companyName || config.companyAddress || config.companyPhone) && (
            <div
              className="text-xs text-muted-foreground mt-1"
              style={{
                color: config.footerTextColor,
                // alinhar este bloco individualmente no eixo cruzado:
                alignSelf: selfByPosition[config.footerPosition as "left" | "center" | "right"],
                // alinhar o texto dentro do bloco:
                textAlign: config.footerPosition as any,
              }}
            >
              {config.companyName && <p className="font-semibold">{config.companyName}</p>}
              {config.companyAddress && <p>{config.companyAddress}</p>}
              {config.companyPhone && <p>{config.companyPhone}</p>}
            </div>
          )}

          {config.qrCodeEnabled && config.qrCodeValue && (
            <img
              alt="QR Code"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=${cmToPx(config.qrCodeSizeCm || 3)}x${cmToPx(
                config.qrCodeSizeCm || 3
              )}&data=${encodeURIComponent(config.qrCodeValue)}&color=${config.qrCodeColor
                ?.replace("#", "")
                .trim()}&bgcolor=${config.qrCodeBgColor?.replace("#", "").trim()}`}
            />
          )}
        </div>
      )}

      {/* Marca d'água */}
      {config.watermarkUrl && (
        <img
          src={config.watermarkUrl}
          alt="Marca d'água"
          className="absolute -z-0"
          style={{
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            opacity: config.watermarkOpacity,
            pointerEvents: "none",
          }}
        />
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
