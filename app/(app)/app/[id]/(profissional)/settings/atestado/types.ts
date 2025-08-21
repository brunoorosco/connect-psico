export type Align = "left" | "center" | "right";
export type Paper = "A4" | "A5";

export interface CertificateConfig {
  paperSize: Paper;
  backgroundColor: string;
  backgroundImage: string;
  backgroundOpacity: number;

  showHeader: boolean;
  headerHeight: string;
  headerBgColor: string;
  headerText: string;
  headerTextColor: string;
  headerAlign: Align;
  headerLogoUrl: string;

  bodyTemplate: string;
  bodyTextColor: string;
  bodyFontSize: number;

  watermarkUrl: string;
  watermarkOpacity: number;

  showFooter: boolean;
  footerHeight: string;
  footerBgColor: string;
  footerText: string;
  footerTextColor: string;
  footerAlign: Align;
  footerLogoUrl: string;

  companyName: string;
  companyAddress: string;
  companyPhone: string;

  qrCodeEnabled: boolean;
  qrCodeValue: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  isGlobal: boolean;
  bodyTemplate: string;
  bodyTextColor: string;
  bodyFontSize: number;
  headerText?: string | null;
  headerAlign: Align;
  headerTextColor: string;
  footerText?: string | null;
  footerAlign: Align;
  footerTextColor: string;
  backgroundColor: string;
  backgroundImage?: string | null;
  backgroundOpacity: number;
  watermarkUrl?: string | null;
  watermarkOpacity: number;
}

export const DEFAULT_CONFIG: CertificateConfig = {
  paperSize: "A4",
  backgroundColor: "#FFFFFF",
  backgroundImage: "",
  backgroundOpacity: 1,

  showHeader: true,
  headerHeight: "4cm",
  headerBgColor: "#FFFFFF",
  headerText: "",
  headerTextColor: "#000000",
  headerAlign: "center",
  headerLogoUrl: "",

  bodyTemplate:
    "Eu, Dr(a). {{medico}}, CRM {{crm}}, atesto para os devidos fins que {{paciente}}, CPF {{cpf}}, foi examinado(a) em {{data}} e necessita de afastamento de {{dias}} dias.",
  bodyTextColor: "#000000",
  bodyFontSize: 16,

  watermarkUrl: "",
  watermarkOpacity: 0.1,

  showFooter: true,
  footerHeight: "4cm",
  footerBgColor: "#FFFFFF",
  footerText: "",
  footerTextColor: "#000000",
  footerAlign: "center",
  footerLogoUrl: "",

  companyName: "",
  companyAddress: "",
  companyPhone: "",

  qrCodeEnabled: false,
  qrCodeValue: "",
};
