"use client"

import React, { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { generateCertificatePdf } from "@/infra/pdf/generateTemplatesPdf"
import { TemplateItem, fetchAllTemplates } from "@services/templates"
import { useCurrentUser } from "@hooks/use-current-user"
import { CertificateType } from "@components/settings/atestado/types"

const LABEL_BY_TYPE: Record<string, string> = {
  atestado: "Atestado",
  comparecimento: "Declaração de Comparecimento",
  acompanhamento: "Declaração de Acompanhamento",
  encaminhamento: "Encaminhamento",
  relatorio: "Relatório Psicológico",
}

// Normaliza paperSize e type vindos da API
function normalizeConfig(item: TemplateItem) {
  const cfg = { ...(item?.configJson ?? {}) }
  // type pode estar dentro do configJson ou podemos derivar de name
  cfg.type = (cfg.type || item.name || "atestado") as CertificateType
  // paperSize pode vir "A5" (maiúsculo): padroniza
  if (typeof cfg.paperSize === "string") {
    const ps = cfg.paperSize.toLowerCase()
    cfg.paperSize = ps === "a5" ? "a5" : "a4"
  } else {
    cfg.paperSize = "a5" // seu payload mostra A5 em todos; ajuste se quiser
  }
  return cfg
}

export default function PatientPage({ params }: { params: { id: string } }) {
  // Dados do paciente (troque pelos reais)
  const basePatient = useMemo(
    () => ({
      paciente: "Anderson Verrone",
      rg: "12.345.678-9",
      cpf: "123.456.789-00",
      idade: 34,
      sintomas: "ansiedade intensa",
      cid: "F41",
      modalidade: "online",
      queixa: "crises de ansiedade",
      tratamento: "terapia cognitivo-comportamental",
      observacoes: "relatou alteração de sono e humor",
      // campos de data que os templates usam:
      data: format(new Date(), "dd/MM/yyyy", { locale: ptBR }).toString(),
      dataExtenso: format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      horario: "08:00", // se algum template usar
      dias: 3, // idem
      inicio: "04/2022", // idem
    }),
    []
  )

  const user = useCurrentUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [selectedId, setSelectedId] = useState<number | "">("")

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const items = await fetchAllTemplates(ac.signal) // ← sua API retorna o array mostrado
        setTemplates(items || [])
        // seleciona o primeiro por padrão
        if (items && items.length) setSelectedId(items[0].id)
      } catch (e: any) {
        console.error(e)
        setError("Não foi possível carregar os modelos.")
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [])

  // Config selecionado (um único)
  const selectedConfig = useMemo(() => {
    if (!selectedId) return null
    const item = templates.find((t) => t.id === selectedId)
    return item ? normalizeConfig(item) : null
  }, [templates, selectedId])

  function handleGenerate() {
    if (!selectedConfig) return
    const professional = { name: user?.name as string, crp: user?.crm as string }
    // Gera PDF e abre em nova aba
    generateCertificatePdf(selectedConfig, professional, basePatient)
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Paciente {basePatient.paciente}</h1>

      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Tipo de documento</label>
          <select
            className="border rounded-md px-3 py-2 min-w-64"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            disabled={loading || !templates.length}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {LABEL_BY_TYPE[t.name] ?? t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedConfig}
          className="px-4 py-2 rounded-xl border bg-black text-white disabled:opacity-60"
          title={selectedConfig ? "Gerar PDF" : "Selecione um modelo"}
        >
          Gerar PDF
        </button>
      </div>


      {loading && <p>Carregando modelos…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {/* <pre>{JSON.stringify(selectedConfig,null,2)}</pre> */}
    </main>
  )
}
