// components/MedicalCertificate.tsx
"use client"

import { useState, useRef } from "react"
import Head from "next/head"
import { format, parse, isValid as isValidDate, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useCurrentUser } from "@hooks/use-current-user"

// shadcn/ui - ajuste os caminhos conforme seu setup
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type LeaveType = "days" | "hours"

interface CertificateData {
  patientName: string
  patientCPF: string
  patientBirthDateISO: string
  doctorName: string
  doctorCRM: string
  issueDateISO: string
  cid: string
  diseaseDescription: string
  treatmentDescription: string
  leaveType: LeaveType
  leaveAmount: number | ""
}

interface CertificateConfig {
  logoUrl: string
  footerText: string
  companyName: string
  companyAddress: string
  companyPhone: string
}

function toISO(brDate: string) {
  // espera "dd/MM/yyyy"
  const dt = parse(brDate, "dd/MM/yyyy", new Date(), { locale: ptBR })
  return isValidDate(dt) ? format(dt, "yyyy-MM-dd") : ""
}

function toBR(iso: string) {
  if (!iso) return ""
  const dt = parse(iso, "yyyy-MM-dd", new Date())
  return isValidDate(dt) ? format(dt, "dd/MM/yyyy", { locale: ptBR }) : ""
}

function todayISO() {
  return format(new Date(), "yyyy-MM-dd")
}

export default function AtestadoPage() {
  const user = useCurrentUser()
  const certificateRef = useRef<HTMLDivElement>(null)

  const [certificateData, setCertificateData] = useState<CertificateData>({
    patientName: "",
    patientCPF: "",
    patientBirthDateISO: "",
    doctorName: "",
    doctorCRM: "",
    issueDateISO: todayISO(),
    cid: "",
    diseaseDescription: "",
    treatmentDescription: "",
    leaveType: "days",
    leaveAmount: "",
  })

  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>({
    logoUrl: "",
    footerText: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
  })

  // estados “visuais” das datas em BR
  const [birthDateBR, setBirthDateBR] = useState("")
  const [issueDateBR, setIssueDateBR] = useState(toBR(todayISO()))

  // --- handlers de campos ---
  const onChangeData = (name: keyof CertificateData, value: any) => setCertificateData((p) => ({ ...p, [name]: value }))

  const onChangeConfig = (name: keyof CertificateConfig, value: any) =>
    setCertificateConfig((p) => ({ ...p, [name]: value }))

  // datas BR -> ISO no blur
  const onBirthBlur = () => onChangeData("patientBirthDateISO", toISO(birthDateBR))
  const onIssueBlur = () => onChangeData("issueDateISO", toISO(issueDateBR))

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => onChangeConfig("logoUrl", reader.result as string)
    reader.readAsDataURL(file)
  }

  // cálculo do retorno quando for em dias
  const computedReturnBR = (() => {
    if (certificateData.leaveType !== "days") return ""
    const n = Number(certificateData.leaveAmount || 0)
    if (!n || !certificateData.issueDateISO) return ""
    const dt = parse(certificateData.issueDateISO, "yyyy-MM-dd", new Date())
    const ret = addDays(dt, n)
    return format(ret, "dd/MM/yyyy", { locale: ptBR })
  })()

  // Impressão isolando só o atestado (CSS @media print já faz isso)
  const handlePrint = () => window.print()

  // Gera um PDF A4 do #certificate (somente o atestado)
  const generatePDFBlob = async (): Promise<Blob> => {
    const el = certificateRef.current
    if (!el) throw new Error("certificateRef não encontrado")
    // aumenta a escala para melhor nitidez no PDF
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let y = 0
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    } else {
      // quebra em múltiplas páginas
      let remainingHeight = imgHeight
      let position = 0
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        remainingHeight -= pageHeight
        if (remainingHeight <= 0) break
        position -= pageHeight
        pdf.addPage()
      }
    }

    const blob = pdf.output("blob")
    return blob
  }

  const handleDownloadPDF = async () => {
    try {
      const blob = await generatePDFBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `atestado-${format(new Date(), "yyyyMMdd-HHmm")}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert("Não foi possível gerar o PDF.")
    }
  }

  const handleShare = async () => {
    // tenta compartilhar o PDF (Web Share API Level 2)
    try {
      const blob = await generatePDFBlob()
      const file = new File([blob], "atestado.pdf", { type: "application/pdf" })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Atestado Médico",
          text: "Atestado médico em PDF.",
          files: [file],
        })
      } else if (navigator.share) {
        // fallback: compartilha link da página
        await navigator.share({
          title: "Atestado Médico",
          text: "Atestado médico — abra o link e use o botão de download.",
          url: window.location.href,
        })
      } else {
        // último fallback: baixa o PDF
        await handleDownloadPDF()
      }
    } catch (err) {
      console.error(err)
      await handleDownloadPDF()
    }
  }

  // frase de afastamento
  const leaveSentence =
    certificateData.leaveType === "days"
      ? certificateData.leaveAmount
        ? `por ${certificateData.leaveAmount} ${Number(certificateData.leaveAmount) === 1 ? "dia" : "dias"}`
        : "por período a definir"
      : certificateData.leaveAmount
      ? `por ${certificateData.leaveAmount} ${Number(certificateData.leaveAmount) === 1 ? "hora" : "horas"}`
      : "por período a definir"

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Modelo de Atestado Médico</title>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #certificate, #certificate * { visibility: visible; }
            #certificate { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Painel de Preenchimento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold mb-6">Preencher Atestado</h2>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-2">Nome do Paciente</label>
            <Input
              value={certificateData.patientName}
              onChange={(e) => onChangeData("patientName", e.target.value)}
              placeholder="Nome completo do paciente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">CPF do Paciente</label>
              <Input
                value={certificateData.patientCPF}
                onChange={(e) => onChangeData("patientCPF", e.target.value)}
                placeholder="CPF"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Data de Nascimento</label>
              <Input
                value={birthDateBR}
                onChange={(e) => setBirthDateBR(e.target.value)}
                onBlur={onBirthBlur}
                type="date"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Data de Emissão</label>
              <Input
                value={issueDateBR}
                onChange={(e) => setIssueDateBR(e.target.value)}
                onBlur={onIssueBlur}
                type="date"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Afastamento</label>
              <div className="flex gap-2">
                <Select
                  value={certificateData.leaveType}
                  onValueChange={(v: LeaveType) => onChangeData("leaveType", v)}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Dias afastado</SelectItem>
                    <SelectItem value="hours">Período em horas</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  className="w-1/3"
                  type="number"
                  min={0}
                  value={certificateData.leaveAmount}
                  onChange={(e) => onChangeData("leaveAmount", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={certificateData.leaveType === "days" ? "Qtd. dias" : "Qtd. horas"}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-2">CID da Doença</label>
            <Input
              value={certificateData.cid}
              onChange={(e) => onChangeData("cid", e.target.value)}
              placeholder="Código CID-10"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-2">Descrição da Doença</label>
            <Textarea
              value={certificateData.diseaseDescription}
              onChange={(e) => onChangeData("diseaseDescription", e.target.value)}
              rows={3}
              placeholder="Descreva a doença ou condição do paciente"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-muted-foreground mb-2">Descrição do Tratamento</label>
            <Textarea
              value={certificateData.treatmentDescription}
              onChange={(e) => onChangeData("treatmentDescription", e.target.value)}
              rows={3}
              placeholder="Descreva o tratamento recomendado"
            />
          </div>
        </div>

        {/* Visualização + ações */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-semibold">Visualização do Atestado</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint}>
                Imprimir
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                Baixar PDF
              </Button>
              <Button onClick={handleShare}>Compartilhar</Button>
            </div>
          </div>

          <div id="certificate" ref={certificateRef} className="border rounded-md p-8 bg-white">
            {/* Logo */}
            {certificateConfig.logoUrl && (
              <div className="flex justify-center mb-6">
                <img src={certificateConfig.logoUrl} alt="Logo da empresa" className="max-h-20 object-contain" />
              </div>
            )}

            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">ATESTADO MÉDICO</h1>
              <div className="border-b w-1/3 mx-auto"></div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4 mb-8">
              <p>
                Eu, <span className="font-semibold">{user?.name}</span>, CRP{" "}
                <span className="font-semibold">{user?.crp}</span>, declaro para os devidos fins que
                o(a) paciente <span className="font-semibold">{certificateData.patientName || "—"}</span>, portador(a)
                do CPF <span className="font-semibold">{certificateData.patientCPF || "—"}</span>, nascido(a) em{" "}
                <span className="font-semibold">{toBR(certificateData.patientBirthDateISO) || "DD/MM/AAAA"}</span>, foi
                examinado(a) e diagnosticado(a) com:
              </p>

              <p>
                <strong>Diagnóstico (CID):</strong> {certificateData.cid || "—"}
              </p>
              <p>
                <strong>Descrição da Doença:</strong> {certificateData.diseaseDescription || "—"}
              </p>
              <p>
                <strong>Tratamento Recomendado:</strong> {certificateData.treatmentDescription || "—"}
              </p>

              <p>
                Recomendo o afastamento das atividades laborais {leaveSentence}
                {certificateData.leaveType === "days" && computedReturnBR ? (
                  <>
                    {" "}
                    , com retorno em <span className="font-semibold">{computedReturnBR}</span>.
                  </>
                ) : (
                  "."
                )}
              </p>
            </div>

            {/* Data e assinatura */}
            <div className="text-right mb-8">
              <p>{toBR(certificateData.issueDateISO) || "DD/MM/AAAA"}</p>
              <p className="mt-2">____________________________________</p>
              <p className="mt-1">{certificateData.doctorName || user?.name || "Médico(a) responsável"}</p>
              <p>CRP: {certificateData.doctorCRM || "—"}</p>
            </div>

            {/* Rodapé personalizado */}
            {certificateConfig.footerText && (
              <div className="border-t pt-4 text-center text-sm">
                <p>{certificateConfig.footerText}</p>
              </div>
            )}

            {/* Informações da empresa */}
            {(certificateConfig.companyName || certificateConfig.companyAddress || certificateConfig.companyPhone) && (
              <div className="mt-6 text-sm text-muted-foreground">
                {certificateConfig.companyName && (
                  <p className="font-semibold text-foreground">{certificateConfig.companyName}</p>
                )}
                {certificateConfig.companyAddress && <p>{certificateConfig.companyAddress}</p>}
                {certificateConfig.companyPhone && <p>Telefone: {certificateConfig.companyPhone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
