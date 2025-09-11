import { templates, titles } from "./templates"

export type Paper = "A4" | "A5"
export type CertificateType = "atestado" | "comparecimento" | "acompanhamento" | "encaminhamento" | "relatorio"

export interface CertificateConfig {
  paperSize: Paper
  type?: CertificateType
  showHeader: boolean
  headerHeight: number
  headerBgColor: string

  bodyTemplate: string
  bodyCityDate?: string
  bodyDateAlign: "left" | "center" | "right"

  bodyTitle: string
  bodyTextColor: string
  bodyFontSize: number
  titleFontSize: number
  titleFontFamily: string

  showFooter: boolean
  footerHeight: number
  footerBgColor: string

  // Fundo
  backgroundColor: string
  backgroundImage: string // dataURL/base64 ou URL
  backgroundOpacity: number // 0..1

  layers?: (TextLayer | ImageLayer | QrLayer)[]
  schemaVersion?: number
}
type LayerBase = {
  id: string
  type: "text" | "image" | "qr"
  x: number // px
  y: number // px
  w?: number // px
  h?: number // px
  rotate?: number // deg
  z?: number // pilha
  lock?: boolean // impede mover
}

type TextLayer = LayerBase & {
  type: "text"
  text: string
  fontSize?: number
  color?: string
  align?: "left" | "center" | "right"
  fontFamily?: string
  bold?: boolean
  italic?: boolean
}

type ImageLayer = LayerBase & {
  type: "image"
  src: string
  objectFit?: "contain" | "cover"
  opacity?: number
}

type QrLayer = LayerBase & {
  type: "qr"
  value: string
  fg?: string
  bg?: string
}

export const DEFAULT_CONFIG: CertificateConfig = {
  paperSize: "A5",
  type: "atestado",

  backgroundColor: "#FFFFFF",
  backgroundImage: "",
  backgroundOpacity: 1,

  showHeader: true,
  headerHeight: 4,
  headerBgColor: "#FFFFFF",

  bodyTemplate: templates["atestado"],
  bodyTitle: titles["atestado"],
  bodyCityDate: "São Paulo",
  bodyDateAlign: "left",
  bodyTextColor: "#000000",
  bodyFontSize: 16,
  titleFontSize: 28,
  titleFontFamily: "verdana",

  showFooter: true,
  footerHeight: 4,
  footerBgColor: "#FFFFFF",
}
