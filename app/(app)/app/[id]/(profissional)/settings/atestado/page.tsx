"use client"
import { useState, useEffect, useCallback } from "react"
import CertificatePreview from "./CertificatePreview"
import CertificateTabs from "./CertificateTabs"
import { CertificateConfig, DEFAULT_CONFIG } from "./types"
import { Button } from "@components/ui"

export default function MedicalCertificate() {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG)

  const onChange = (key: keyof CertificateConfig, value: any) => setConfig((p) => ({ ...p, [key]: value }))
  const onFile = (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => onChange(key, reader.result)
    reader.readAsDataURL(file)
  }
  // ✅ salvar no localStorage e baixar JSON
  const handleSave = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2)
    try {
      localStorage.setItem("certificate:config", dataStr)
    } catch {}

    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `certificate-config-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [config])

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔝 Top bar fixa */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-sm font-medium">Configuração do Certificado</h1>
          <Button onClick={handleSave}>Salvar configurações</Button>
        </div>
      </div>
      {/* <main className="max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <CertificateTabs config={config} onChange={onChange} onFile={onFile} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <CertificatePreview config={config} user={{ name: "Dr. Fulano", crm: "12345" }} />
          </div>
        </div>
      {/* </main> */}
    </div>
  )
}
