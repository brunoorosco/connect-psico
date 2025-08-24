import { templates, titles } from "./templates"

export type Align = "top" | "middle" | "bottom"
export type Position = "left" | "center" | "right"
export type Paper = "A4" | "A5"

export interface CertificateConfig {
  paperSize: Paper
  type: "atestado" | "comparecimento" | "acompanhamento" | "encaminhamento" | "relatorio"
  showHeader: boolean
  headerHeight: number
  headerBgColor: string
  headerText: string
  headerTextColor: string
  headerAlign: Align
  headerPosition: Position
  headerLogoUrl: string
  headerFontSize: number // ex: "18px" | "1.25rem"
  headerFontFamily: string // ex: "inter", "times", ...

  bodyTemplates: Record<string, string>
  bodyTitles: Record<string, string>
  bodyTextColor: string
  bodyFontSize: number
  titleFontSize: number
  titleFontFamily: string

  showFooter: boolean
  footerHeight: number
  footerBgColor: string
  footerText: string
  footerTextColor: string
  footerAlign: Align
  footerPosition: Position
  footerLogoUrl: string
  footerFontFamily: string

  companyName: string
  companyAddress: string
  companyPhone: string

  qrCodeEnabled: boolean
  qrCodeValue: string
  qrCodeColor: string // hex ex: #000000
  qrCodeBgColor: string // hex ex: #FFFFFF
  qrCodeSizeCm?: number

  // Fundo
  backgroundColor: string
  backgroundImage: string // dataURL/base64 ou URL
  backgroundOpacity: number // 0..1

  // Marca d’água
  watermarkUrl: string // dataURL/base64 ou URL
  watermarkOpacity: number // 0..1
  watermarkWidthPct?: number // 10..100 (default 60)
  watermarkTopPct?: number // 0..100 (default 30)
  watermarkLeftPct?: number // 0..100 (default 50)
}

// export interface TemplateItem {
//   id: string
//   name: string
//   isGlobal: boolean
//   bodyTemplate: string
//   bodyTextColor: string
//   bodyFontSize: number
//   headerText?: string | null
//   headerAlign: Align
//   headerPosition: Position
//   headerTextColor: string
//   footerText?: string | null
//   footerAlign: Align
//   footerTextColor: string
//   backgroundColor: string
//   backgroundImage?: string | null
//   backgroundOpacity: number
//   watermarkUrl?: string | null
//   watermarkOpacity: number
// }

export const DEFAULT_CONFIG: CertificateConfig = {
  paperSize: "A5",
  type: "atestado",

  backgroundColor: "#FFFFFF",
  backgroundImage: "",
  backgroundOpacity: 1,

  showHeader: true,
  headerHeight: 4,
  headerBgColor: "#FFFFFF",
  headerText: "",
  headerTextColor: "#000000",
  headerAlign: "middle",
  headerPosition: "center",
  headerLogoUrl: "",
  headerFontSize: 18,
  headerFontFamily: "inter", // qualquer chave sua (ver map no preview)

  bodyTemplates: {
    atestado: templates["atestado"],
    comparecimento: templates["comparecimento"],
    acompanhamento: templates["acompanhamento"],
    encaminhamento: templates["encaminhamento"],
    relatorio: templates["relatorio"],
  },
  bodyTitles: {
    atestado: titles["atestado"],
    comparecimento: titles["comparecimento"],
    acompanhamento: titles["acompanhamento"],
    encaminhamento: titles["encaminhamento"],
    relatorio: titles["relatorio"],
  },
  bodyTextColor: "#000000",
  bodyFontSize: 16,
  titleFontSize: 28,
  titleFontFamily: "verdana",

  watermarkUrl: "",
  watermarkOpacity: 0.1,

  showFooter: true,
  footerHeight: 4,
  footerBgColor: "#FFFFFF",
  footerText: "",
  footerTextColor: "#000000",
  footerAlign: "middle",
  footerPosition: "center",
  footerLogoUrl: "",
  footerFontFamily: "inter", // qualquer chave sua (ver map no preview)

  companyName: "",
  companyAddress: "",
  companyPhone: "",

  qrCodeEnabled: false,
  qrCodeValue: "",
  qrCodeColor: "#000000",
  qrCodeBgColor: "#FFFFFF",
  qrCodeSizeCm: 3, // por exemplo, 3 cm

  watermarkWidthPct: 60,
  watermarkTopPct: 30,
  watermarkLeftPct: 50,
}
