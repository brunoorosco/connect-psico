import { PDFDocument, rgb } from "pdf-lib"
import Mustache from "mustache"
import fontkit from "@pdf-lib/fontkit"

type CertificateConfig = any
type User = { name?: string; crp?: string; crm?: string }

type PdfFontPack = { regular: any; bold?: any }
type FontMap = Record<string, PdfFontPack>

const CM_TO_PT = 28.3464567
const A4 = { w: 595.28, h: 841.89 }
const A5 = { w: 419.53, h: 595.28 }
const cm = (n: number) => n * CM_TO_PT
const PX_TO_PT = 72 / 96 // 0.75
const pxToPt = (px: number) => px * PX_TO_PT

const hexToRgb = (hex?: string) => {
  const m = hex?.match(/^#?([0-9a-f]{6})$/i)
  if (!m) return rgb(0, 0, 0)
  const n = parseInt(m[1], 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

// ---------- FONTS ----------
async function fetchAsBytes(src: string) {
  if (src?.startsWith("data:")) {
    const base64 = src.split(",")[1] ?? ""
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }
  const res = await fetch(src, { mode: "cors" })
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

async function loadFonts(doc: PDFDocument): Promise<FontMap> {
  // precisa do fontkit para fontes custom
  doc.registerFontkit(fontkit)

  const load = async (path?: string | null) => (path ? doc.embedFont(await fetchAsBytes(path)) : null)

  const verdana = await load("/fonts/verdana.ttf")
  const verdanaBold = await load("/fonts/verdana-bold.ttf")
  const inter = await load("/fonts/inter-regular.ttf")
  const interBold = await load("/fonts/inter-bold.ttf")
  const tahoma = await load("/fonts/tahoma.ttf")
  // adicione outras se usar no config (ex.: brush, roboto...)

  const pack = (reg: any, b?: any): PdfFontPack => ({
    regular: reg ?? inter ?? verdana ?? tahoma,
    bold: b ?? interBold ?? verdanaBold,
  })

  return {
    verdana: pack(verdana, verdanaBold),
    inter: pack(inter, interBold),
    tahoma: pack(tahoma),
    // fallbacks
    sans: pack(inter ?? verdana ?? tahoma, interBold ?? verdanaBold),
    serif: pack(verdana ?? inter ?? tahoma, verdanaBold ?? interBold),
    monospace: pack(tahoma ?? inter ?? verdana),
  }
}
function pickFont(fonts: FontMap, family?: string, weight: "regular" | "bold" = "regular") {
  const key = (family ?? "").toLowerCase()
  const pack = fonts[key] ?? fonts.sans
  return weight === "bold" ? pack.bold ?? pack.regular : pack.regular
}
const lineHeightFor = (font: any, size: number, factor = 1.3) => font.heightAtSize(size) * factor

// ---------- TEXTO ----------
function wrapParagraph(text: string, maxWidth: number, measure: (s: string) => number) {
  // quebra um parágrafo em linhas com largura máxima
  const words = text.split(/\s+/)
  const lines: { text: string; width: number }[] = []
  let cur = ""
  for (const w of words) {
    const t = cur ? cur + " " + w : w
    if (measure(t) <= maxWidth) cur = t
    else {
      if (cur) lines.push({ text: cur, width: measure(cur) })
      cur = w
    }
  }
  if (cur) lines.push({ text: cur, width: measure(cur) })
  return lines
}

function drawAlignedText(
  page: any,
  text: string,
  x0: number,
  y: number,
  maxW: number,
  font: any,
  size: number,
  color: any,
  align: "left" | "center" | "right" | "justify",
  isLastOfPara: boolean
) {
  if (!text) return
  const w = font.widthOfTextAtSize(text, size)

  if (align === "left" || (align === "justify" && (isLastOfPara || !text.includes(" ")))) {
    page.drawText(text, { x: x0, y, size, font, color })
    return
  }
  if (align === "center") {
    page.drawText(text, { x: x0 + (maxW - w) / 2, y, size, font, color })
    return
  }
  if (align === "right") {
    page.drawText(text, { x: x0 + (maxW - w), y, size, font, color })
    return
  }
  // justify (não última linha): distribui espaço entre palavras
  const words = text.split(" ")
  const plain = words.join("")
  const plainW = font.widthOfTextAtSize(plain, size)
  const gaps = Math.max(1, words.length - 1)
  const extra = Math.max(0, (maxW - plainW) / gaps)

  let x = x0
  for (let i = 0; i < words.length; i++) {
    const ww = font.widthOfTextAtSize(words[i], size)
    page.drawText(words[i], { x, y, size, font, color })
    x += ww
    if (i < words.length - 1) x += extra
  }
}

// ---------- GERADOR ----------
export async function generateCertificatePdf(
  config: CertificateConfig,
  user: User = {},
  data: Record<string, any> = {}
) {
  const paperRaw = (config.paperSize || "a5").toString().toLowerCase()
  const paper = paperRaw === "a4" ? A4 : A5

  const doc = await PDFDocument.create()
  const pageAdd = () => doc.addPage([paper.w, paper.h])
  let page = pageAdd()

  // fontes
  const fonts = await loadFonts(doc)
  const titleFont = pickFont(fonts, config.titleFontFamily, "regular")
  const bodyFont = pickFont(fonts, config.bodyFontFamily ?? config.titleFontFamily, "regular")

  // ---------- DESENHO DE FUNDO/HEADER/FOOTER (por página) ----------
  // cache da imagem de fundo para reusar em novas páginas
  let bgImg: any = null
  let bgScale: { w: number; h: number } | null = null
  if (config.backgroundImage) {
    try {
      const bytes = await fetchAsBytes(config.backgroundImage)
      const isPng = config.backgroundImage.startsWith("data:image/png") || /\.png(\?|$)/i.test(config.backgroundImage)
      bgImg = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
      const { width, height } = bgImg.scale(1)
      const scale = Math.max(paper.w / width, paper.h / height)
      bgScale = { w: width * scale, h: height * scale }
    } catch {}
  }

  const drawPageChrome = () => {
    // background color
    if (config.backgroundColor) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: paper.w,
        height: paper.h,
        color: hexToRgb(config.backgroundColor),
        opacity: config.backgroundOpacity ?? 1,
      })
    }
    // background image
    if (bgImg && bgScale) {
      page.drawImage(bgImg, {
        x: (paper.w - bgScale.w) / 2,
        y: (paper.h - bgScale.h) / 2,
        width: bgScale.w,
        height: bgScale.h,
        opacity: config.backgroundOpacity ?? 1,
      })
    }
    // header/footer
    if (config.showHeader && (config.headerHeight ?? 0) > 0) {
      page.drawRectangle({
        x: 0,
        y: paper.h - cm(config.headerHeight),
        width: paper.w,
        height: cm(config.headerHeight),
        color: hexToRgb(config.headerBgColor || "#fff"),
      })
    }
    if (config.showFooter && (config.footerHeight ?? 0) > 0) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: paper.w,
        height: cm(config.footerHeight),
        color: hexToRgb(config.footerBgColor || "#fff"),
      })
    }
  }

  drawPageChrome()

  // ---------- ÁREA ÚTIL ----------
  const H_PAD_PT = pxToPt(32) // px-8 (32px) -> 24pt
  const V_EXTRA_PT = pxToPt(16) // +16px no topo/rodapé

  const topPad = (config.showHeader ? cm(config.headerHeight || 0) : 0) + V_EXTRA_PT
  const bottomPad = (config.showFooter ? cm(config.footerHeight || 0) : 0) + V_EXTRA_PT

  const contentX = H_PAD_PT
  const contentW = paper.w - H_PAD_PT * 2
  let y = paper.h - topPad

  // helper de quebra de página
  const ensureSpace = (need: number) => {
    if (y - need <= bottomPad) {
      page = pageAdd()
      drawPageChrome()
      y = paper.h - topPad
    }
  }

  // ---------- TÍTULO ----------
  const title = (config.bodyTitle ?? "").trim()
  if (title) {
    // 👇 CONVERTE px -> pt (0.75) e usa fallback do seu config (26px)
    const tsPx = Number(config.titleFontSize) || 26
    const ts = pxToPt(tsPx)

    const color = hexToRgb(config.bodyTextColor || "#111827")
    const tw = titleFont.widthOfTextAtSize(title, ts)
    ensureSpace(ts + pxToPt(16)) // reserva espaço p/ o próprio título + margem de 16px

    page.drawText(title, {
      x: contentX + (contentW - tw) / 2,
      y: y - ts,
      size: ts,
      font: titleFont,
      color,
    })

    const TITLE_MB = pxToPt(16)
    y -= lineHeightFor(titleFont, ts, 1.0) + TITLE_MB
  }

  // ---------- CORPO ----------
  const fs = pxToPt(Number(config.bodyFontSize) || 14)
  const bodyColor = hexToRgb(config.bodyTextColor || "#111827")
  const bodyAlign = (config.bodyAlign || "justify") as "left" | "center" | "right" | "justify"
  const lhFactor = typeof config.bodyLineHeight === "number" ? config.bodyLineHeight : 1.5 // Tailwind leading-normal
  const lh = lineHeightFor(bodyFont, fs, lhFactor)
  const paraGap = typeof config.bodyParagraphSpacing === "number" ? config.bodyParagraphSpacing : cm(0.2)

  const raw = Mustache.render(config.bodyTemplate ?? "", {
    medico: user?.name ?? "",
    crp: user?.crp ?? user?.crm ?? "",
    crm: user?.crm ?? user?.crp ?? "",
    ...(data || {}),
  })
  const rendered = raw.replaceAll("&#x2F;", "/")

  const paragraphs = rendered.split(/\n{2,}/) // quebra de parágrafo por linhas em branco
  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p]
    const lines = wrapParagraph(para, contentW, (s) => bodyFont.widthOfTextAtSize(s, fs))
    for (let i = 0; i < lines.length; i++) {
      ensureSpace(lh)
      y -= lh
      const isLast = i === lines.length - 1
      drawAlignedText(page, lines[i].text, contentX, y, contentW, bodyFont, fs, bodyColor, bodyAlign, isLast)
    }
    if (p < paragraphs.length - 1) {
      ensureSpace(paraGap)
      y -= paraGap
    }
  }

  // ---------- ASSINATURA ----------
  const sigFs = Math.max(12, fs)
  const signNeed = cm(1.2) + sigFs * 2
  ensureSpace(signNeed)

  const signY = Math.max(y - cm(1.2), cm(3))
  page.drawLine({
    start: { x: paper.w - contentX - cm(6), y: signY },
    end: { x: paper.w - contentX, y: signY },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  })
  page.drawText(user?.name || "Profissional", {
    x: paper.w - contentX - cm(6),
    y: signY - cm(0.5),
    size: sigFs,
    font: bodyFont,
    color: bodyColor,
  })
  const cr = user?.crp ? `CRP: ${user.crp}` : user?.crm ? `CRM: ${user.crm}` : ""
  if (cr) {
    page.drawText(cr, {
      x: paper.w - contentX - cm(6),
      y: signY - cm(1.0),
      size: sigFs,
      font: bodyFont,
      color: bodyColor,
    })
  }

  // ---------- (Opcional) LAYERS de texto básicos ----------
  if (Array.isArray(config.layers)) {
    for (const layer of config.layers) {
      if (layer?.type === "text" && typeof layer.text === "string") {
        const fam = layer.fontFamily ?? config.titleFontFamily
        const f = pickFont(fonts, fam, "regular")

        const sPx = Number(layer.fontSize) || 12
        const s = pxToPt(sPx)

        const c = hexToRgb(layer.color || "#000000")
        const txt = layer.text

        const wTxt = f.widthOfTextAtSize(txt, s)
        const wBox = layer.w != null ? pxToPt(layer.w) : wTxt

        let x = pxToPt(layer.x)
        if (layer.align === "center") x = pxToPt(layer.x) + (wBox - wTxt) / 2
        if (layer.align === "right") x = pxToPt(layer.x) + (wBox - wTxt)

        const baselineShift = s // aprox. topo->baseline
        const hBox = layer.h != null ? pxToPt(layer.h) : lineHeightFor(f, s, 1.1)
        // centraliza baseline dentro da caixa
        let yPdf = paper.h - pxToPt(layer.y) - (hBox - s) / 3 - s
        yPdf = Math.max(yPdf, 2)

        page.drawText(txt, { x, y: yPdf, size: s, font: f, color: c })
      }

      // (QR/imagens podem ser adicionados se quiser 1:1 com o editor)
    }
  }

  const pdfBytes = await doc.save()
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank", "noopener,noreferrer")
}
