"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@components/ui"
import { toast } from "sonner"
import { useCurrentUser } from "@hooks/use-current-user"
import { CertificateConfig, DEFAULT_CONFIG } from "@components/settings/atestado/types"
import CertificateTabs from "@components/settings/atestado/CertificateTabs"
import CertificatePreview from "@components/settings/atestado/CertificatePreview"

export default function MedicalCertificate() {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const user = useCurrentUser()

  // Carrega template por ?id=...
  useEffect(() => {
    // const id = new URLSearchParams(window.location.search).get("id")
    // if (!id) return

    const ac = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/templates`, { signal: ac.signal })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setTemplateId(data.id)
        setConfig(data.configJson as CertificateConfig)
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Falha ao carregar template:", err)
          toast.error("Erro ao carregar o template.")
        }
      }
    })()

    return () => ac.abort()
  }, [])

  const onChange = useCallback(<K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result === "string") {
          onChange(key as any, result as any) // seus campos aceitam dataURL/URL
        }
      }
      reader.readAsDataURL(file)
      // opcional: limpar input para poder reupar mesmo arquivo
      e.currentTarget.value = ""
    },
    [onChange]
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      console.log("page.tsx:66", config)
      const payload = { name: "Modelo Atestado", configJson: config }
      const isUpdate = Boolean(templateId)
      const res = await fetch(isUpdate ? `/api/templates/${templateId}` : `/api/templates`, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (!templateId && data?.id) {
        setTemplateId(data.id)
        // Atualiza a URL para incluir ?id=...
        const url = new URL(window.location.href)
        url.searchParams.set("id", data.id)
        window.history.replaceState(null, "", url.toString())
      }
      toast.success("Configuração salva!")
    } catch (err) {
      console.error("Erro ao salvar:", err)
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }, [config, templateId])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar fixa */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-sm font-medium">Configuração de Documentos</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </div>

      <main className="max-w-8xl mx-auto w-full p-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificateTabs config={config} onChange={onChange} onFile={onFile} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificatePreview config={config} user={{ name: user?.name || "Psicologo", crp: user?.crm || "123456" }} />
        </div>
      </main>
    </div>
  )
}
