// app/api/summarize/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

/** ===== Tipos ===== */
type Intervention = {
  name: string // ex.: "Reestruturação cognitiva (TCC)"
  why: string // 1 frase do racional
  steps: string[] // até 3 passos práticos e curtos
}

type SummarizeOutput = {
  mini_summary: string // 2–3 frases
  key_points: string[] // ≤5
  action_items: string[] // ≤3
  interventions: Intervention[] // ≤2
  risk_alert: string | null // 1 frase ou null
}

/** (Opcional — apenas referência; quem valida é o function-calling) */
const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    mini_summary: { type: "string" },
    key_points: { type: "array", items: { type: "string" } },
    action_items: { type: "array", items: { type: "string" } },
    interventions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          why: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
        },
        required: ["name", "why", "steps"],
        additionalProperties: false,
      },
    },
    risk_alert: { type: ["string", "null"] },
  },
  required: ["mini_summary", "key_points", "action_items", "interventions", "risk_alert"],
  additionalProperties: false,
} as const

/** Modelos preferidos (o loop faz fallback se algum falhar) */
const MODEL_PREFS = [
  "gpt-5-mini", // se existir na sua conta
  "gpt-4.1-mini", // fallback
  "gpt-4o-mini", // fallback estável p/ chat.completions
] as const

/** ===== Utils ===== */
function chunkByChars(s: string, max = 12000) {
  const out: string[] = []
  for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max))
  return out
}
function clampArr<T>(arr: T[], n: number) {
  return Array.isArray(arr) ? arr.slice(0, n) : []
}
function dedupeStr(arr: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const it of arr) {
    const k = (it || "").trim()
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase())
      out.push(k)
    }
  }
  return out
}

/** ===== Summarize de um chunk (Chat Completions + functions) ===== */
async function summarizeChunk(model: string, text: string, lang: string): Promise<SummarizeOutput> {
  const sys = [
    `Você é um assistente que ajuda psicólogos a resumirem sessões em ${lang}.`,
    `Seja extremamente conciso: mini-resumo 2–3 frases; bullets curtos.`,
    `Intervenções: TCC, ACT, mindfulness, psicoeducação (sem diagnóstico/prescrição).`,
    `Risco: 1 frase se houver; senão null.`,
  ].join(" ")

  const user = [
    "Resuma o texto da sessão seguindo os limites:",
    "- mini_summary (2–3 frases)",
    "- key_points (≤5)",
    "- action_items (≤3)",
    "- interventions (≤2) com name/why/steps (≤3)",
    "- risk_alert (string ou null)",
    "",
    "=== TEXTO ===",
    text,
  ].join("\n")

  // ✅ Chat Completions (compat amplo de SDKs)
  const resp = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    functions: [
      {
        name: "return_summary",
        description: "Retorna o resumo estruturado da sessão.",
        parameters: SUMMARY_SCHEMA as any,
      },
    ],
    function_call: { name: "return_summary" },
  } as any)

  const choice = resp.choices?.[0]?.message
  const rawArgs =
    choice?.function_call?.arguments ??
    choice?.content ?? // fallback caso o modelo escreva o JSON no content
    null

  if (!rawArgs) {
    throw new Error("Função não foi chamada nem retornou JSON.")
  }

  const parsed: SummarizeOutput = JSON.parse(typeof rawArgs === "string" ? rawArgs : String(rawArgs))

  // “cinto de segurança”
  parsed.mini_summary = (parsed.mini_summary ?? "").split(/\s+/).slice(0, 80).join(" ")
  parsed.key_points = clampArr(dedupeStr(parsed.key_points ?? []), 5)
  parsed.action_items = clampArr(dedupeStr(parsed.action_items ?? []), 3)
  parsed.interventions = clampArr(parsed.interventions ?? [], 2).map((iv) => ({
    name: (iv?.name ?? "").slice(0, 80),
    why: (iv?.why ?? "").slice(0, 160),
    steps: clampArr(
      (iv?.steps ?? []).map((s) => String(s).slice(0, 120)),
      3
    ),
  }))
  parsed.risk_alert = parsed.risk_alert ? String(parsed.risk_alert).slice(0, 200) : null

  return parsed
}

/** ===== Merge de múltiplos chunks ===== */
function merge(results: SummarizeOutput[]): SummarizeOutput {
  if (results.length === 1) return results[0]
  const first = results[0]
  return {
    mini_summary: first.mini_summary,
    key_points: clampArr(dedupeStr(results.flatMap((r) => r.key_points)), 5),
    action_items: clampArr(dedupeStr(results.flatMap((r) => r.action_items)), 3),
    interventions: clampArr(
      results.flatMap((r) => r.interventions),
      2
    ),
    risk_alert: results.find((r) => r.risk_alert)?.risk_alert ?? null,
  }
}

/** ===== Handler ===== */
export async function POST(req: NextRequest) {
  try {
    const { text, language = "pt-BR", max_chars_per_chunk = 12000 } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 })
    }
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 })
    }

    const chunks = chunkByChars(text.trim(), Math.max(2000, max_chars_per_chunk))
    const partials: SummarizeOutput[] = []

    for (const ck of chunks) {
      let lastErr: any
      for (const m of MODEL_PREFS) {
        try {
          partials.push(await summarizeChunk(m, ck, language))
          lastErr = null
          break
        } catch (e) {
          lastErr = e
          // tenta próximo modelo
          continue
        }
      }
      if (lastErr) {
        return NextResponse.json(
          { error: "OpenAI summarization failed (chunk)", details: String(lastErr) },
          { status: 502 }
        )
      }
    }

    const merged = merge(partials)
    return NextResponse.json(merged)
  } catch (e: any) {
    return NextResponse.json({ error: "Summarize endpoint failed", details: e?.message ?? String(e) }, { status: 500 })
  }
}
