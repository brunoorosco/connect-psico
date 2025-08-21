// lib/schemas/certificate.ts
import { z } from "zod"

export const CertificateConfigSchema = z.object({
  paperSize: z.enum(["A4", "A5"]),
  backgroundColor: z.string(),
  backgroundImage: z.string(),
  backgroundOpacity: z.number(),

  showHeader: z.boolean(),
  headerHeight: z.number(), // em cm
  headerBgColor: z.string(),
  headerText: z.string(),
  headerTextColor: z.string(),
  headerAlign: z.enum(["top", "middle", "bottom"]),
  headerPosition: z.enum(["left", "center", "right"]),
  headerLogoUrl: z.string(),
  headerFontSize: z.number(),
  headerFontFamily: z.string(),

  bodyTemplate: z.string(),
  bodyTextColor: z.string(),
  bodyFontSize: z.number(),

  titleFontSize: z.number(),
  titleFontFamily: z.string(),

  watermarkUrl: z.string(),
  watermarkOpacity: z.number(),

  showFooter: z.boolean(),
  footerHeight: z.number(), // em cm
  footerBgColor: z.string(),
  footerText: z.string(),
  footerTextColor: z.string(),
  footerAlign: z.enum(["top", "middle", "bottom"]),
  footerPosition: z.enum(["left", "center", "right"]),
  footerLogoUrl: z.string(),
  footerFontFamily: z.string(),

  companyName: z.string(),
  companyAddress: z.string(),
  companyPhone: z.string(),

  qrCodeEnabled: z.boolean(),
  qrCodeValue: z.string(),
  qrCodeColor: z.string(),
  qrCodeBgColor: z.string(),
  qrCodeSizeCm: z.number(),

  watermarkWidthPct: z.number(),
  watermarkTopPct: z.number(),
  watermarkLeftPct: z.number(),
})

export type CertificateConfigModel = {
  id: string
  userId: string
  configJson: z.infer<typeof CertificateConfigSchema>
}
