// lib/schemas/certificate.ts
import { z } from "zod"

/** Enums reutilizáveis */
export const PaperSizeSchema = z.enum(["A4", "A5"])
export const HPosSchema = z.enum(["left", "center", "right"])
export const VPosSchema = z.enum(["top", "middle", "bottom"])
export const ObjectFitSchema = z.enum(["contain", "cover"])
export const CertTypeSchema = z.enum(["atestado", "comparecimento", "acompanhamento", "encaminhamento", "relatorio"])

/** Base das camadas */
const BaseLayerSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "image", "qr", "signature"]),
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  rotate: z.number().default(0).optional(),
  z: z.number().optional(),
  lock: z.boolean().default(false).optional(),
})

/** Camada de texto */
export const TextLayerSchema = BaseLayerSchema.extend({
  type: z.literal("text"),
  text: z.string().default(""),
  fontSize: z.number().min(1).default(16).optional(),
  color: z.string().default("#111111").optional(),
  align: HPosSchema.default("left").optional(),
  fontFamily: z.string().default("inherit").optional(),
  bold: z.boolean().default(false).optional(),
  italic: z.boolean().default(false).optional(),
  opacity: z.number().min(0).max(1).default(1).optional(),
  background: z.string().default("transparent").optional(),
  padding: z.number().default(0).optional(),
})
export const SignatureLayerSchema = BaseLayerSchema.extend({
  type: z.literal("signature"),
  name: z.string().default(""),
  crp: z.string().default(""),
  fontFamily: z.string().default("inherit").optional(),
  fontSize: z.number().min(1).default(16).optional(),
  color: z.string().default("#111111").optional(),
  align: HPosSchema.default("left").optional(),
  showLine: z.boolean().optional(), // exibir linha
  lineWidthPct: z.number().max(100).min(0),
  lineThickness: z.number().max(10).min(0),
  gapLineToName: z.number().max(10).min(0),
  gapNameToCrp: z.number().max(10).min(0),
})

/** Camada de imagem */
export const ImageLayerSchema = BaseLayerSchema.extend({
  type: z.literal("image"),
  src: z.string(), // normalmente a URL pública (Cloudinary)
  publicId: z.string().optional(), // opcional, útil p/ transform/delete
  objectFit: ObjectFitSchema.default("contain").optional(),
  opacity: z.number().min(0).max(1).default(1).optional(),
})

/** Camada de QR */
export const QrLayerSchema = BaseLayerSchema.extend({
  type: z.literal("qr"),
  value: z.string().default(""),
  fg: z.string().default("#000000").optional(),
  bg: z.string().default("#FFFFFF").optional(),
})

/** Discriminated union das camadas */
export const AnyLayerSchema = z.discriminatedUnion("type", [TextLayerSchema, ImageLayerSchema, QrLayerSchema, SignatureLayerSchema])

/** Config completa do certificado (com defaults) */
export const CertificateConfigSchema = z
  .object({
    type: CertTypeSchema.default("atestado"),

    paperSize: PaperSizeSchema.default("A4"),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),

    showHeader: z.boolean().default(false),
    headerHeight: z.number().min(0).default(3), // cm
    headerBgColor: z.string().default("#ffffff"),

    showFooter: z.boolean().default(false),
    footerHeight: z.number().min(0).default(3), // cm
    footerBgColor: z.string().default("#ffffff"),

    companyName: z.string().default(""),
    companyAddress: z.string().default(""),
    companyPhone: z.string().default(""),

    watermarkUrl: z.string().url().optional().or(z.literal("")).default(""),
    watermarkOpacity: z.number().min(0).max(1).default(0.06),

    bodyTitle: z.string().default(""),
    bodyTemplate: z.string().default(""),
    bodyTextColor: z.string().default("#000000"),
    bodyFontSize: z.number().min(1).default(14),
    titleFontSize: z.number().min(1).default(20),
    titleFontFamily: z.string().default("serif"),

    // Camadas arrastáveis:
    layers: z.array(AnyLayerSchema).default([]),
  })
  .passthrough() // permite chaves extras sem quebrar parse (bom p/ evolução)
// .strict()    // use estrito se quiser bloquear chaves desconhecidas

/** Types gerados do schema */
export type CertificateConfig = z.infer<typeof CertificateConfigSchema>
export type AnyLayer = z.infer<typeof AnyLayerSchema>
export type TextLayer = z.infer<typeof TextLayerSchema>
export type ImageLayer = z.infer<typeof ImageLayerSchema>
export type QrLayer = z.infer<typeof QrLayerSchema>
export type SignatureLayer = z.infer<typeof SignatureLayerSchema>

/** Modelo salvo no banco */
export type CertificateConfigModel = {
  id: string
  userId: string
  name: string
  configJson: CertificateConfig
}
