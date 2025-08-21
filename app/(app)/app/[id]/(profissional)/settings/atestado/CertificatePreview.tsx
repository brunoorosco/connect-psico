import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Mustache from "mustache";

import { CertificateConfig } from "./types";

interface Props {
  config: CertificateConfig;
  user?: { name?: string; crm?: string };
}

export default function CertificatePreview({ config, user }: Props) {
  const renderedBody = Mustache.render(config.bodyTemplate, {
    medico: user?.name ?? "",
    crm: user?.crm ?? "",
    paciente: "Nome do Paciente",
    cpf: "000.000.000-00",
    data: format(new Date(), "dd/MM/yyyy", { locale: ptBR }),
    dias: 3,
  });

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
          backgroundColor: config.backgroundColor,
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: config.backgroundOpacity,
        }}
      />

      {/* Header */}
      {config.showHeader && (
        <div
          className="absolute left-0 w-full px-8 flex flex-col items-center justify-center z-10"
          style={{
            top: 0,
            height: config.headerHeight,
            background: config.headerBgColor,
            color: config.headerTextColor,
            textAlign: config.headerAlign as any,
          }}
        >
          {config.headerLogoUrl && <img src={config.headerLogoUrl} className="max-h-16 object-contain my-1" />}
          {config.headerText && <p className="text-sm">{config.headerText}</p>}
        </div>
      )}

      {/* Footer */}
      {config.showFooter && (
        <div
          className="absolute left-0 w-full px-8 flex flex-col items-center justify-center border-t z-10"
          style={{
            bottom: 0,
            height: config.footerHeight,
            background: config.footerBgColor,
            color: config.footerTextColor,
            textAlign: config.footerAlign as any,
          }}
        >
          {config.footerLogoUrl && <img src={config.footerLogoUrl} className="max-h-16 object-contain my-1" />}
          {config.footerText && <p className="text-sm">{config.footerText}</p>}

          {(config.companyName || config.companyAddress || config.companyPhone) && (
            <div className="text-xs text-muted-foreground text-center mt-1">
              {config.companyName && <p className="font-semibold">{config.companyName}</p>}
              {config.companyAddress && <p>{config.companyAddress}</p>}
              {config.companyPhone && <p>Tel: {config.companyPhone}</p>}
            </div>
          )}

          {config.qrCodeEnabled && config.qrCodeValue && (
            <img
              className="mt-2"
              alt="QR Code"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                config.qrCodeValue
              )}`}
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
          paddingTop: `calc(${config.showHeader ? config.headerHeight : "0px"} + 16px)`,
          paddingBottom: `calc(${config.showFooter ? config.footerHeight : "0px"} + 16px)`,
          color: config.bodyTextColor,
          fontSize: `${config.bodyFontSize}px`,
        }}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">ATESTADO MÉDICO</h1>
          <div className="border-b w-1/3 mx-auto"></div>
        </div>
        <div className="space-y-4 mb-6 whitespace-pre-wrap">{renderedBody}</div>
        <div className="text-right mt-6">
          <p>{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
          <p className="mt-2">____________________________________</p>
          <p className="mt-1">{user?.name || "Médico(a)"}</p>
          <p>CRM: {user?.crm}</p>
        </div>
      </div>
    </div>
  );
}
