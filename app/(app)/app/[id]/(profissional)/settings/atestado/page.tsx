"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@components/ui"
import { toast } from "sonner"
import { useCurrentUser } from "@hooks/use-current-user"
import {
  CertificateConfig,
  CertificateType,
  DEFAULT_CONFIG,
} from "@components/settings/atestado/types"
import CertificateTabs from "@components/settings/atestado/CertificateTabs"
import CertificatePreview from "@components/settings/atestado/CertificatePreview"
import { templates, titles } from "@components/settings/atestado/templates"

// rótulo para o botão salvar
const LABEL_BY_TYPE: Record<CertificateType, string> = {
  atestado: "Atestado",
  comparecimento: "Declaração de Comparecimento",
  acompanhamento: "Declaração de Acompanhamento",
  encaminhamento: "Encaminhamento",
  relatorio: "Relatório Psicológico",
}

// título “efetivo”: se o usuário digitou bodyTitle usa ele, senão cai no default por tipo
function effectiveTitle(cfg: CertificateConfig): string {
  const t: CertificateType = cfg.type ?? "atestado"
  return (cfg.bodyTitle?.trim() || titles[t] || LABEL_BY_TYPE[t] || "Documento")
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

  // estado do modelo “atual” (o que a UI está editando)
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG)

  // mapeia IDs por tipo (para saber se faz PUT ou POST)
  const [idsByType, setIdsByType] = useState<Partial<Record<CertificateType, string>>>({})

  // cache local de todos os modelos do usuário (por tipo)
  const [modelsByType, setModelsByType] = useState<
    Partial<Record<CertificateType, CertificateConfig>>
  >({})

  const [saving, setSaving] = useState(false)

  // Carrega TODOS os modelos do usuário
  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        // Ajuste o endpoint conforme sua API.
        // Esperado: array com itens { id, type, configJson }
        const res = await fetch(`/api/templates?scope=all`, { signal: ac.signal })
        if (!res.ok) throw new Error(await res.text())
        const raw = await res.json()

        // Normaliza resposta (suporta array direto ou {items:[]})
        const items: TemplateItem[] = Array.isArray(raw) ? raw : raw?.items ?? []

        const nextIds: Partial<Record<CertificateType, string>> = {}
        const nextModels: Partial<Record<CertificateType, CertificateConfig>> = {}

        for (const it of items) {
          const t = (it?.type ?? it?.configJson?.type) as CertificateType | undefined
          if (!t) continue
          nextIds[t] = it.id
          // garanta que o config tem type correto
          const cfg = { ...(it.configJson ?? {}), type: t } as CertificateConfig
          nextModels[t] = cfg
        }

        setIdsByType(nextIds)
        setModelsByType(nextModels)

        // define o tipo inicial e o modelo atual
        const initialType: CertificateType = (nextModels.atestado?.type ||
          "atestado") as CertificateType

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
  }, []) // ← inicial

  // onChange genérico: intercepta mudança do TIPO para trocar o modelo atual;
  // demais campos apenas atualizam o modelo atual.
  const onChange = useCallback(
    <K extends keyof CertificateConfig>(key: K, value: CertificateConfig[K]) => {
      if (key === "type") {
        const newType = value as CertificateType
        setConfig((prev) => {
          // se já temos o modelo desse tipo no cache, usa ele;
          // senão cria um novo a partir do template default
          const next = modelsByType[newType] ?? makeDefaultConfig(newType)
          return next
        })
        return
      }

      // atualização normal de campos do modelo atual
      setConfig((prev) => ({ ...prev, [key]: value }))
    },
    [modelsByType]
  )

  // upload de arquivos (logo, fundo etc.)
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

  // Salva (upsert) apenas o modelo do TIPO ATUAL
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
        name,               // nome amigável salvo no banco (corrige “título não vai pro banco”)
        configJson: config, // modelo completo (inclui bodyTitle/bodyTemplate)
      }

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

  const currentLabel =
    LABEL_BY_TYPE[config.type ?? "atestado"] ?? "Documento"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar fixa */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-sm font-medium">Configuração de Documentos</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : `Salvar ${currentLabel}`}
          </Button>
        </div>
      </div>

      <main className="max-w-8xl mx-auto w-full p-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificateTabs config={config} onChange={onChange} onFile={onFile} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <CertificatePreview
            config={config}
            user={{ name: user?.name || "Psicologo", crp: user?.crm || "123456" }}
          />
        </div>
      </main>
    </div>
  )
}
