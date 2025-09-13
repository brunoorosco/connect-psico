"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Mustache from "mustache"
import QRCode from "qrcode"

import { CertificateConfig, CertificateType } from "./types"
import { headerFontStacks } from "./constants"
import { templates, titles } from "./templates"
import DraggableLayer, { type AnyLayer, type QrLayer } from "./DraggableLayer"
import { hexToRgba } from "@/utils/paper"
import { useEffect, useMemo, useState } from "react"

interface Props {
  config: CertificateConfig & { layers?: AnyLayer[] }
  user?: { name?: string; crp?: string }
  editing?: boolean
  onLayerChange?: (id: string, patch: Partial<AnyLayer>) => void
  data?: Record<string, any>
}

export default function CertificatePreview({
  config,
  user,
  editing = false,
  onLayerChange,
  data,
}: Props) {
  const type: CertificateType = config?.type || "atestado"
  const title =
    (config.bodyTitle?.trim()?.length ? config.bodyTitle : titles[type]) ?? ""
  const template =
    (config.bodyTemplate?.trim()?.length ? config.bodyTemplate : templates[type]) ?? ""
  const dataExtenso = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  function safeTemplate(template: string) {
    return template
      .replace(/{{(?!\s*[\w\.]+\s*}})/g, "&#123;&#123;")
      .replace(/(?<!{{\s*[\w\.]+\s*)}}/g, "&#125;&#125;")
  }

  const safe = safeTemplate(template)

  const renderedBody = useMemo(
    () =>
      Mustache.render(safe, {
        nome: user?.name ?? "",
        crp: user?.crp ?? "",
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
        ...(data ?? {}),
      }).replaceAll("&#x2F;", "/"),
    [safe, user?.name, user?.crp, data, dataExtenso]
  )

  // ------- QRCode renderer usando qrcode -------
  function QrRenderer({ qr }: { qr: QrLayer }) {
    const [src, setSrc] = useState<string>("")

    useEffect(() => {
      let mounted = true
      async function gen() {
        try {
          const dataUrl = await QRCode.toDataURL(String(qr.value), {
            width: Math.round(Math.min(qr.w ?? 128, qr.h ?? 128)),
            margin: 0,
            color: {
              dark: qr.fg || "#000000",
              light: qr.bg || "#FFFFFF",
            },
          })
          if (mounted) setSrc(dataUrl)
        } catch (e) {
          console.error("Erro ao gerar QRCode:", e)
        }
      }
      gen()
      return () => {
        mounted = false
      }
    }, [qr.value, qr.w, qr.h, qr.fg, qr.bg])

    if (!src) return null
    return (
      <img
        src={src}
        alt="QR"
        className="w-full h-full pointer-events-none"
        draggable={false}
      />
    )
  }

  // --------- Preview 1:1 em PX ----------
  const PT_TO_PX = 96 / 72
  const CM_TO_PX = 96 / 2.54 // 37.79527559

  const A4_PT = { w: 595.28, h: 841.89 }
  const A5_PT = { w: 419.53, h: 595.28 }
  const paperPt =
    (config.paperSize || "a5").toString().toLowerCase() === "a4" ? A4_PT : A5_PT
  const paperPx = {
    w: Math.round(paperPt.w * PT_TO_PX),
    h: Math.round(paperPt.h * PT_TO_PX),
  }

  // paddings do conteúdo (iguais ao PDF-preview)
  const H_PAD_PX = 32 // px-8
  const V_EXTRA_PX = 16 // +16px

  // header/footer em PX (sem usar cm no CSS pra evitar arredondamento diferente)
  const headerPx = config.showHeader ? (Number(config.headerHeight) || 0) * CM_TO_PX : 0
  const footerPx = config.showFooter ? (Number(config.footerHeight) || 0) * CM_TO_PX : 0

  const bodyFontFamily =
    (config as any).bodyFontFamily
      ? headerFontStacks[(config as any).bodyFontFamily] ?? (config as any).bodyFontFamily
      : headerFontStacks[config.titleFontFamily] ?? "serif"

  const bodyLineHeight = (config as any).bodyLineHeight ?? 1.5 // mesmo default do PDF

  return (
    <div className="relative">
      <div
        id="certificate"
        className="relative rounded-md bg-white overflow-hidden print:shadow-none mx-auto"
        style={{
          // width/height do papel em PX
          width: `${paperPx.w}px`,
          height: `${paperPx.h}px`,
          // usar outline (não influi no conteúdo como a border)
          outline: "1px solid rgba(0,0,0,0.1)",
          boxSizing: "content-box",
        }}
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
        {config.showHeader && headerPx > 0 && (
          <div
            className="absolute left-0 top-0 w-full flex flex-col z-10"
            style={{
              height: `${headerPx}px`,
              background: hexToRgba(config.headerBgColor),
            }}
          />
        )}

        {/* Footer */}
        {config.showFooter && footerPx > 0 && (
          <div
            className="absolute left-0 w-full flex flex-col justify-center z-10"
            style={{
              bottom: 0,
              height: `${footerPx}px`,
              background: hexToRgba(config.footerBgColor),
              paddingLeft: `${H_PAD_PX}px`,
              paddingRight: `${H_PAD_PX}px`,
            }}
          />
        )}

        {/* Layers */}
        {Array.isArray(config.layers) && config.layers.length > 0 && (
          <div
            id="layers"
            className={`absolute inset-0 z-50 ${editing ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            {config.layers.map((layer) => (
              <DraggableLayer
                key={layer.id}
                layer={layer}
                boundsSelector="#certificate"
                editable={editing}
                onChange={(patch) => onLayerChange?.(layer.id, patch)}
                renderQr={(qr: QrLayer) => <QrRenderer qr={qr} />}
              />
            ))}
          </div>
        )}

        {/* Conteúdo (texto mustache) */}
        <div
          className="relative z-10"
          style={{
            paddingLeft: `${H_PAD_PX}px`,
            paddingRight: `${H_PAD_PX}px`,
            paddingTop: `${headerPx + V_EXTRA_PX}px`,
            paddingBottom: `${footerPx + V_EXTRA_PX}px`,
            color: config.bodyTextColor,
            fontSize: `${config.bodyFontSize}px`,
            fontFamily: bodyFontFamily,
            lineHeight: bodyLineHeight,
          }}
        >
          <div
            className="text-center"
            style={{
              fontSize: `${config.titleFontSize}px`,
              marginBottom: "16px",
              fontFamily: headerFontStacks[config.titleFontFamily] ?? bodyFontFamily,
            }}
          >
            {title}
          </div>

          <div className="mb-6 whitespace-pre-wrap text-justify">
            {renderedBody}
          </div>
          <div style={{textAlign: config.bodyDateAlign}}>
            {config.bodyCityDate ? config.bodyCityDate + ", " + dataExtenso : "" }
          </div>
        </div>
      </div>
    </div>
  )
}
