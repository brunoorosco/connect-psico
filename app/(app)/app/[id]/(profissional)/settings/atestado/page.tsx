"use client"

import { useState, useRef, useEffect } from "react"
import Head from "next/head"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useCurrentUser } from "@hooks/use-current-user"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface CertificateConfig {
  logoUrl: string
  logoPosition: "header" | "footer"
  watermarkUrl: string
  footerText: string
  footerColor: string
  footerAlign: "left" | "center" | "right"
  companyName: string
  companyAddress: string
  companyPhone: string
  paperSize: "A4" | "A3"
}

export default function MedicalCertificate() {
  const user = useCurrentUser()
  const certificateRef = useRef<HTMLDivElement>(null)

  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>({
    logoUrl: "",
    logoPosition: "header",
    watermarkUrl: "",
    footerText: "",
    footerColor: "#000000",
    footerAlign: "center",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    paperSize: "A4",
  })

  useEffect(() => {
    // Carregar configuração já salva
    fetch("/api/certificate-config")
      .then((res) => res.json())
      .then((data) => {
        if (data) setCertificateConfig((prev) => ({ ...prev, ...data }))
      })
  }, [])

  const onChangeConfig = (name: keyof CertificateConfig, value: any) =>
    setCertificateConfig((p) => ({ ...p, [name]: value }))

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CertificateConfig) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => onChangeConfig(field, reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/certificate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certificateConfig),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      alert("Configurações salvas com sucesso!")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar configurações")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Configuração de Atestado</title>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Painel de Configuração */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h3 className="text-lg font-medium">Configurações do Atestado</h3>

          {/* Logo */}
          <div>
            <label className="block text-sm mb-2">Logo da Empresa</label>
            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logoUrl")} />
          </div>

          {/* Posição do Logo */}
          <div>
            <label className="block text-sm mb-2">Posição do Logo</label>
            <Select
              value={certificateConfig.logoPosition}
              onValueChange={(v) => onChangeConfig("logoPosition", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Cabeçalho</SelectItem>
                <SelectItem value="footer">Rodapé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marca d’água */}
          <div>
            <label className="block text-sm mb-2">Marca d’água</label>
            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "watermarkUrl")} />
          </div>

          {/* Nome, telefone, endereço */}
          <Input
            value={certificateConfig.companyName}
            onChange={(e) => onChangeConfig("companyName", e.target.value)}
            placeholder="Nome da empresa"
          />
          <Input
            value={certificateConfig.companyPhone}
            onChange={(e) => onChangeConfig("companyPhone", e.target.value)}
            placeholder="Telefone"
          />
          <Input
            value={certificateConfig.companyAddress}
            onChange={(e) => onChangeConfig("companyAddress", e.target.value)}
            placeholder="Endereço"
          />

          {/* Texto rodapé */}
          <Textarea
            value={certificateConfig.footerText}
            onChange={(e) => onChangeConfig("footerText", e.target.value)}
            placeholder="Texto do rodapé"
          />

          {/* Cor e alinhamento do rodapé */}
          <div className="flex gap-4">
            <div>
              <label className="block text-sm mb-2">Cor do Rodapé</label>
              <Input
                type="color"
                value={certificateConfig.footerColor}
                onChange={(e) => onChangeConfig("footerColor", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Alinhamento</label>
              <Select
                value={certificateConfig.footerAlign}
                onValueChange={(v) => onChangeConfig("footerAlign", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tamanho da folha */}
          <div>
            <label className="block text-sm mb-2">Tamanho da Folha</label>
            <Select value={certificateConfig.paperSize} onValueChange={(v) => onChangeConfig("paperSize", v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="A3">A3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão salvar */}
          <Button onClick={handleSubmit} className="w-full">
            Salvar Configurações
          </Button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border relative">
          <div
            id="certificate"
            ref={certificateRef}
            className={`
      border rounded-md p-8 bg-white relative mx-auto
      w-full max-w-3xl aspect-[210/297]   // mantém proporção de A4 no preview
    `}
            data-size={certificateConfig.paperSize} // atributo p/ CSS controlar na impressão
          >
            {/* Marca d’água */}
            {certificateConfig.watermarkUrl && (
              <img
                src={certificateConfig.watermarkUrl}
                alt="Marca d’água"
                className="absolute opacity-10 w-1/2 top-1/4 left-1/4 -z-10"
              />
            )}
            {/* Logo Header */}
            {certificateConfig.logoUrl && certificateConfig.logoPosition === "header" && (
              <div className="flex justify-center mb-6">
                <img src={certificateConfig.logoUrl} alt="Logo" className="max-h-20 object-contain" />
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-4">ATESTADO MÉDICO(modelo)</h1>
              <div className="border-b w-1/3 mx-auto"></div>
            </div>

            <div className="space-y-4 mb-8">
              <p>
                Eu, <span className="font-semibold">{user?.name}</span>, CRM{" "}
                <span className="font-semibold">{user?.crm}</span>, declaro que o(a) paciente{" "}
                <span className="font-semibold">{"Nome do Paciente"}</span>, CPF{" "}
                <span className="font-semibold">{"XXX.XXX.XXX-XX"}</span>, nascido(a) em{" "}
                <span className="font-semibold">{"DD/MM/AAAA"}</span>, foi examinado(a).
              </p>
              <p>
                <strong>Diagnóstico:</strong> {"CID-XXXX"}
              </p>
              <p>
                <strong>Tratamento:</strong> {"Recomendação"}
              </p>
              <p>Recomendo afastamento de {"3"} dias.</p>
            </div>

            <div className="text-right mb-8">
              <p>{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
              <p className="mt-2">____________________________________</p>
              <p className="mt-1">{user?.name || "Médico(a)"}</p>
              <p>CRM: {user?.crm}</p>
            </div>

            {/* Rodapé fixo */}
            {(certificateConfig.footerText ||
              (certificateConfig.logoUrl && certificateConfig.logoPosition === "footer") ||
              certificateConfig.companyName ||
              certificateConfig.companyAddress ||
              certificateConfig.companyPhone) && (
              <div
                className="absolute left-0 w-full px-8 border-t"
                style={{
                  bottom: "3cm", // 4 cm do final da página
                  color: certificateConfig.footerColor,
                  textAlign: certificateConfig.footerAlign as any,
                }}
              >
                {certificateConfig.logoUrl && certificateConfig.logoPosition === "footer" && (
                  <div className="flex justify-center my-2">
                    <img src={certificateConfig.logoUrl} alt="Logo" className="max-h-20 object-contain" />
                  </div>
                )}
                {certificateConfig.footerText && <p className="text-sm mb-2">{certificateConfig.footerText}</p>}

                {(certificateConfig.companyName ||
                  certificateConfig.companyAddress ||
                  certificateConfig.companyPhone) && (
                  <div
                    className="text-sm text-muted-foreground text-center mt-2"
                    style={{
                      color: certificateConfig.footerColor,
                      textAlign: certificateConfig.footerAlign as any,
                    }}
                  >
                    {certificateConfig.companyName && <p className="font-semibold">{certificateConfig.companyName}</p>}
                    {certificateConfig.companyAddress && <p>{certificateConfig.companyAddress}</p>}
                    {certificateConfig.companyPhone && <p>Tel: {certificateConfig.companyPhone}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
