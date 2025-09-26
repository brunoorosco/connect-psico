import { CertificateType } from "@components/settings/atestado/types"

export type AnyLayer = any // troque pelo tipo real se quiser
export type CertificateConfig = {
  type: CertificateType
  paperSize?: "a4" | "a5"
  bodyTitle?: string
  bodyTemplate?: string
  bodyFontSize?: number
  titleFontSize?: number
  bodyTextColor?: string
  showHeader?: boolean
  headerHeight?: number
  headerBgColor?: string
  showFooter?: boolean
  footerHeight?: number
  footerBgColor?: string
  backgroundColor?: string
  backgroundImage?: string
  backgroundOpacity?: number
  layers?: AnyLayer[]
}
export type TemplateItem = {
  id: number
  name?: string
  type: CertificateType
  configJson: CertificateConfig
}

export async function fetchAllTemplates(signal?: AbortSignal): Promise<TemplateItem[]> {
  const res = await fetch(`/api/templates?scope=all`, { signal })
  if (!res.ok) throw new Error(await res.text())
  const raw = await res.json()
  return Array.isArray(raw) ? raw : raw?.items ?? []
}

export async function fetchTemplateById(id: string): Promise<TemplateItem> {
  const res = await fetch(`/api/templates/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function fetchTemplateByName(name: string): Promise<TemplateItem> {
  const res = await fetch(`/api/templates/${name}`)
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function upsertTemplate(payload: {
  id?: string | null
  name: CertificateType
  configJson: CertificateConfig
}): Promise<{ id: string }> {
  const { id, ...body } = payload
  const res = await fetch(id ? `/api/templates/${id}` : `/api/templates`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}
