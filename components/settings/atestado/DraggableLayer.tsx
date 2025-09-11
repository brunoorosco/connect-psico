import { memo, CSSProperties, useMemo } from "react"
import { Rnd } from "react-rnd"

export type BaseLayer = {
  id: string
  type: "text" | "image" | "qr" | "signature"
  x: number
  y: number
  w?: number
  h?: number
  rotate?: number
  z?: number
  lock?: boolean
}

export type TextLayer = BaseLayer & {
  type: "text"
  text: string
  fontSize?: number
  color?: string
  align?: "left" | "center" | "right"
  fontFamily?: string
  bold?: boolean
  italic?: boolean
  opacity?: number
  background?: string
  padding?: number
}

export type ImageLayer = BaseLayer & {
  type: "image"
  src: string
  publicId?: string
  objectFit?: "contain" | "cover"
  opacity?: number
}

export type QrLayer = BaseLayer & {
  type: "qr"
  value: string
  fg?: string
  bg?: string
}

// ✅ NOVO: camada de assinatura
export type SignatureLayer = BaseLayer & {
  type: "signature"
  // texto/estilo
  name?: string
  crp?: string
  fontFamily?: string
  fontSize?: number // px
  color?: string
  align?: "left" | "center" | "right"
  // linha
  showLine?: boolean // exibir linha
  lineWidthPct?: number // 0..100 (% da largura da caixa)
  lineThickness?: number // px
  // espaçamentos (opcionais, em px)
  gapLineToName?: number // espaço entre linha e nome
  gapNameToCrp?: number // espaço entre nome e crp
}

export type AnyLayer = TextLayer | ImageLayer | QrLayer | SignatureLayer

type Props = {
  layer: AnyLayer
  boundsSelector?: string
  editable?: boolean
  onChange?: (patch: Partial<AnyLayer>) => void
  renderQr?: (layer: QrLayer) => React.ReactNode
}

function SignatureView({ layer }: { layer: SignatureLayer }) {
  const {
    w = 220,
    h = 70,
    fontFamily = "inherit",
    fontSize = 14,
    color = "#111",
    align = "right",
    showLine = true,
    lineWidthPct = 50, // 0..100
    lineThickness = 1,
    gapLineToName = 8,
    gapNameToCrp = 4,
  } = layer

  const lineY = useMemo(() => {
    const safe = Math.max(0, h - fontSize * 2.2)
    return Math.min(safe, Math.max(fontSize, h * 0.65))
  }, [h, fontSize])

  // ✅ cálculo correto da largura da linha
  const pct = Math.max(0, Math.min(100, Number(lineWidthPct ?? 100)))
  const maxMultiplier = 1.0 // deixe 1.0 se quiser limitar a 100% do box; aumente p/ 2.0 se quiser até 200%
  const lw = w * (pct / 100) * maxMultiplier

  // se quiser que o box “acompanhe” a linha (pelo menos não menor que ela):
  const effectiveBoxW = Math.max(w, lw)

  const lineLeft = align === "center" ? (effectiveBoxW - lw) / 2 : align === "right" ? effectiveBoxW - lw : 0

  const textAlign = align === "center" ? "center" : align === "right" ? "right" : "left"

  return (
    <div className="w-full h-full relative select-none" style={{ fontFamily }}>
      {/* Conteúdo interno com largura efetiva acompanhando a linha */}
      <div style={{ position: "absolute", inset: 0, width: effectiveBoxW, height: h }}>
        {/* Linha de assinatura */}
        {showLine && (
          <div
            style={{
              position: "absolute",
              left: lineLeft,
              top: lineY,
              width: lw,
              height: 0,
              borderBottom: `${lineThickness}px solid #000`,
            }}
          />
        )}

        {/* Nome */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: lineY + gapLineToName,
            width: effectiveBoxW,
            textAlign,
            fontSize,
            color,
            whiteSpace: "nowrap",
          }}
        >
          {layer.name || "Profissional"}
        </div>

        {/* CRP */}
        {layer.crp ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: lineY + gapLineToName + fontSize + gapNameToCrp,
              width: effectiveBoxW,
              textAlign,
              fontSize,
              color,
              whiteSpace: "nowrap",
            }}
          >
            {layer.crp}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const DraggableLayer = memo(
  ({ layer, boundsSelector = "#certificate", editable = false, onChange, renderQr }: Props) => {
    const style: CSSProperties = {
      position: "absolute",
      zIndex: layer.z ?? 40,
      pointerEvents: "auto",
    }

    // ---------- RENDER ESTÁTICO ----------
    if (!editable) {
      return (
        <div
          style={{
            ...style,
            left: layer.x,
            top: layer.y,
            width: layer.w,
            height: layer.h,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: layer.rotate && layer.rotate % 360 !== 0 ? `rotate(${layer.rotate}deg)` : undefined,
            }}
          >
            {layer.type === "image" ? (
              <img
                src={(layer as ImageLayer).src}
                alt=""
                className="w-full h-full"
                style={{
                  objectFit: (layer as ImageLayer).objectFit ?? "contain",
                  opacity: (layer as ImageLayer).opacity ?? 1,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            ) : layer.type === "qr" ? (
              renderQr ? (
                renderQr(layer as QrLayer)
              ) : (
                <div />
              )
            ) : layer.type === "signature" ? (
              <SignatureView layer={layer as SignatureLayer} />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  color: (layer as TextLayer).color ?? "#111",
                  fontSize: (layer as TextLayer).fontSize ?? 16,
                  textAlign: (layer as TextLayer).align ?? "left",
                  fontFamily: (layer as TextLayer).fontFamily ?? "inherit",
                  fontWeight: (layer as TextLayer).bold ? 700 : 400,
                  fontStyle: (layer as TextLayer).italic ? "italic" : "normal",
                  opacity: (layer as TextLayer).opacity ?? 1,
                  background: (layer as TextLayer).background ?? "transparent",
                  padding: (layer as TextLayer).padding ?? 0,
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    (layer as TextLayer).align === "center"
                      ? "center"
                      : (layer as TextLayer).align === "right"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                {(layer as TextLayer).text}
              </div>
            )}
          </div>
        </div>
      )
    }

    // ---------- RENDER EDITÁVEL (react-rnd) ----------
    return (
      <Rnd
        default={{
          x: layer.x ?? 0,
          y: layer.y ?? 0,
          width: layer.w ?? "auto",
          height: layer.h ?? "auto",
        }}
        position={{ x: layer.x ?? 0, y: layer.y ?? 0 }}
        size={{ width: layer.w ?? "auto", height: layer.h ?? "auto" }}
        bounds={boundsSelector}
        enableResizing={!layer.lock}
        disableDragging={!!layer.lock}
        onDragStop={(_e, d) => onChange?.({ x: d.x, y: d.y })}
        onResizeStop={(_e, _dir, ref, _delta, pos) =>
          onChange?.({
            w: ref.offsetWidth,
            h: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          })
        }
        style={style}
        className="group"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: layer.rotate && layer.rotate % 360 !== 0 ? `rotate(${layer.rotate}deg)` : undefined,
          }}
        >
          {layer.type === "image" ? (
            <img
              src={(layer as ImageLayer).src}
              alt=""
              className="w-full h-full"
              style={{
                objectFit: (layer as ImageLayer).objectFit ?? "contain",
                opacity: (layer as ImageLayer).opacity ?? 1,
                userSelect: "none",
              }}
              draggable={false}
            />
          ) : layer.type === "qr" ? (
            renderQr ? (
              renderQr(layer as QrLayer)
            ) : (
              <div />
            )
          ) : layer.type === "signature" ? (
            <SignatureView layer={layer as SignatureLayer} />
          ) : (
            <div
              className="w-full h-full"
              style={{
                color: (layer as TextLayer).color ?? "#111",
                fontSize: (layer as TextLayer).fontSize ?? 16,
                textAlign: (layer as TextLayer).align ?? "left",
                fontFamily: (layer as TextLayer).fontFamily ?? "inherit",
                fontWeight: (layer as TextLayer).bold ? 700 : 400,
                fontStyle: (layer as TextLayer).italic ? "italic" : "normal",
                opacity: (layer as TextLayer).opacity ?? 1,
                background: (layer as TextLayer).background ?? "transparent",
                padding: (layer as TextLayer).padding ?? 0,
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  (layer as TextLayer).align === "center"
                    ? "center"
                    : (layer as TextLayer).align === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {(layer as TextLayer).text}
            </div>
          )}
        </div>

        {/* guia visual ao passar o mouse */}
        <div className="absolute inset-0 border border-dashed border-slate-400/50 opacity-0 group-hover:opacity-100 pointer-events-none" />
      </Rnd>
    )
  }
)

export default DraggableLayer
