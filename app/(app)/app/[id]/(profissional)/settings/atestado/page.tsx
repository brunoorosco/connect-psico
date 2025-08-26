"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@components/ui"
import { toast } from "sonner"
import { useCurrentUser } from "@hooks/use-current-user"
import { CertificateConfig, CertificateType, DEFAULT_CONFIG } from "@components/settings/atestado/types"
import CertificateTabs from "@components/settings/atestado/CertificateTabs"
import CertificatePreview from "@components/settings/atestado/CertificatePreview"
import { templates, titles } from "@components/settings/atestado/templates"
import LayersPanel from "@components/settings/atestado/LayersPanel"
import type { AnyLayer } from "@components/settings/atestado/DraggableLayer"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const LABEL_BY_TYPE: Record<CertificateType, string> = {
  atestado: "Atestado",
  comparecimento: "Declaração de Comparecimento",
  acompanhamento: "Declaração de Acompanhamento",
  encaminhamento: "Encaminhamento",
  relatorio: "Relatório Psicológico",
}

function effectiveTitle(cfg: CertificateConfig): string {
  const t: CertificateType = cfg.type ?? "atestado"
  return cfg.bodyTitle?.trim() || titles[t] || LABEL_BY_TYPE[t] || "Documento"
}

// cria um modelo novo baseado no template default do tipo
function makeDefaultConfig(type: CertificateType): CertificateConfig {
  return {
    ...DEFAULT_CONFIG,
    type,
    bodyTitle: titles[type] ?? "",
    bodyTemplate: templates[type] ?? "",
  }
}

type TemplateItem = {
  id: string
  type: CertificateType
  name?: string
  configJson: CertificateConfig
}

export default function MedicalCertificate() {
  const user = useCurrentUser()

  // ---- Estados principais primeiro ----
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG)
  const [idsByType, setIdsByType] = useState<Partial<Record<CertificateType, string>>>({})
  const [modelsByType, setModelsByType] = useState<Partial<Record<CertificateType, CertificateConfig>>>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("body")
  const isLayersTab = activeTab != "body"
  const [templates, setTemplates] = useState<TemplateItem[]>([])

  // ---- Edição de camadas ----
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [editLayers, setEditLayers] = useState(true)

  // ---- Carregar modelos do backend ----
  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/templates?scope=all`, { signal: ac.signal })
        if (!res.ok) throw new Error(await res.text())
        const raw = await res.json()

        const items: TemplateItem[] = Array.isArray(raw) ? raw : raw?.items ?? []
        setTemplates(items)

        const nextIds: Partial<Record<CertificateType, string>> = {}
        const nextModels: Partial<Record<CertificateType, CertificateConfig>> = {}

        for (const it of items) {
          const t = (it?.name ?? it?.configJson?.type) as CertificateType | undefined
          if (!t) continue
          nextIds[t] = it.id
          const cfg = { ...(it.configJson ?? {}), type: t } as CertificateConfig
          nextModels[t] = cfg
        }

        setIdsByType(nextIds)
        setModelsByType(nextModels)

        const initialType: CertificateType = (nextModels.atestado?.type || "atestado") as CertificateType
        setConfig(nextModels[initialType] ?? makeDefaultConfig(initialType))
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Falha ao carregar modelos:", err)
          // mesmo se falhar, mantemos um modelo default
          setConfig(makeDefaultConfig("atestado"))
          toast.error("Não foi possível carregar seus modelos.")
        }
      }
    })()

    return () => ac.abort()
  }, [])
  const handleLoadTemplate = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      // Assumindo payload: { id, name, type, configJson }
      const loadedType: CertificateType = (data?.type || data?.configJson?.type || "atestado") as CertificateType
      const loadedConfig = { ...DEFAULT_CONFIG, ...(data?.configJson || {}), type: loadedType } as CertificateConfig

      // Hidrata o editor com o que veio do banco
      setConfig(loadedConfig)

      // Atualiza caches auxiliares (id por tipo e "modelsByType" local)
      setIdsByType((prev) => ({ ...prev, [loadedType]: data?.id }))
      setModelsByType((prev) => ({ ...prev, [loadedType]: loadedConfig }))

      toast.success("Modelo carregado!")
    } catch (err) {
      console.error("Falha ao carregar modelo:", err)
      toast.error("Não foi possível carregar o modelo.")
    }
  }, [])

  // ---- onChange centralizado ----
  const onChange = useCallback(
    <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => {
      if (key === "type") {
        const newType = value as CertificateType
        setConfig(() => {
          const next = modelsByType[newType] ?? makeDefaultConfig(newType)
          return next
        })
        return
      }
      setConfig((prev) => ({ ...prev, [key]: value }))
    },
    [modelsByType]
  )

  // ---- Upload de imagens ----
  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, key: keyof CertificateConfig) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result === "string") {
          onChange(key as any, result as any)
        }
      }
      reader.readAsDataURL(file)
      e.currentTarget.value = ""
    },
    [onChange]
  )

  // ---- Camadas: setLayers / handleLayerChange ----
  const setLayers = useCallback(
    (layers: AnyLayer[]) => {
      onChange("layers" as any, layers as any)
    },
    [onChange]
  )

  const handleLayerChange = useCallback((id: string, patch: Partial<AnyLayer>) => {
    // Evita depender do "config" no dependency array
    setConfig((prev) => {
      const prevLayers = ((prev as any).layers ?? []) as AnyLayer[]
      const nextLayers = prevLayers.map((l) => (l.id === id ? { ...l, ...patch } : l))
      return { ...prev, layers: nextLayers as any }
    })
  }, [])

  // ---- Salvar (upsert) apenas o modelo do TIPO ATUAL ----
  const handleSave = useCallback(async () => {
    if (!config.type) {
      toast.error("Selecione um tipo de documento.")
      return
    }
    setSaving(true)
    try {
      const t = config.type
      const id = idsByType[t] ?? null
      const name = effectiveTitle(config) // título “efetivo”

      const payload = {
        type: t,
        name, // nome amigável salvo no banco
        configJson: config, // modelo completo (inclui bodyTitle/bodyTemplate/layers)
      }
      console.log('[page.tsx:194]', { config });

      const res = await fetch(id ? `/api/templates/${id}` : `/api/templates`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const newId = data?.id ?? id ?? null

      // sincroniza cache local
      setIdsByType((prev) => ({ ...prev, [t]: newId ?? undefined }))
      setModelsByType((prev) => ({ ...prev, [t]: { ...config } }))

      toast.success(`${LABEL_BY_TYPE[t]} salvo!`)
    } catch (err) {
      console.error("Erro ao salvar:", err)
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }, [config, idsByType])

  const currentLabel = LABEL_BY_TYPE[config.type ?? "atestado"] ?? "Documento"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar fixa */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-xl font-medium">Modelos de Documentos</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : `Salvar ${currentLabel}`}
          </Button>
        </div>
      </div>

      <main className="max-w-8xl mx-auto w-full p-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Coluna de Configurações */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificateTabs config={config} onChange={onChange} onFile={onFile} onTabChange={setActiveTab} />

          {isLayersTab && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={editLayers} onCheckedChange={setEditLayers} />
                <Label>Modo edição de camadas</Label>
              </div>

              <LayersPanel
                layers={(config as any).layers as AnyLayer[]}
                selectedId={selectedLayerId}
                onChange={setLayers}
                onSelect={setSelectedLayerId}
              />
            </div>
          )}
        </div>

        {/* Coluna de Preview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificatePreview
            config={config as any}
            user={{ name: user?.name || "Psicologo", crp: user?.crm || "123456" }}
            editing={editLayers}
            onLayerChange={handleLayerChange}
          />
        </div>
      </main>
    </div>
  )
}
