// app/api/summarize/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

type SummarizeOutput = {
  summary: string
  key_points: string[]
  action_items: string[]
  warnings: string[]
}

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    key_points: { type: "array", items: { type: "string" } },
    action_items: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "key_points", "action_items", "warnings"],
  additionalProperties: false,
} as const

const MODEL_PREFS = [
  "gpt-5-mini", // rápido/barato (ex.: summarization)
  "gpt-4.1-mini", // fallback
  "gpt-4o-mini", // fallback adicional
]

function chunkByChars(s: string, max = 12000) {
  const out: string[] = []
  for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max))
  return out
}

async function summarizeChunk(model: string, text: string, lang: string): Promise<SummarizeOutput> {
  const sys = `Você é um psicólogo e psicanalista renomado. Sua tarefa é resumir sessões de terapia em ${lang} de forma clara, objetiva e concisa.

  Regras:
  1. Forneça um resumo breve e fiel ao texto da sessão.
  2. Sempre levante exatamente 3 aspectos positivos e 3 aspectos negativos.
  3. Indique uma direção prática (action_items) que o psicólogo deve seguir.
  4. Liste possíveis riscos, sinais de alerta ou pontos de atenção em "warnings".
  5. Nunca invente informações — apenas use o que está no texto.
  Formato obrigatório de saída (JSON válido):
{
  "summary": "Resumo breve da sessão",
  "key_points": {
     "positives": ["positivo1","positivo2","positivo3"],
     "negatives": ["negativo1","negativo2","negativo3"]
  },
  "action_items": ["ação1","ação2"],
  "warnings": ["alerta1","alerta2"]
}
`;

  const resp = await client.responses.create({
    model,
    // Responses API aceita "input" (mensagens simplificadas). Também aceita "system" via "input" com role, dependendo do SDK;
    // Para compatibilidade simples, juntamos instrução + texto.
    input: `${sys}\n\n=== TEXTO ===\n${text}`,

    // response_format: {
    //   type: "json_schema",
    //   json_schema: {
    //     name: "ConsultationSummary",
    //     schema: SUMMARY_SCHEMA,
    //     strict: true,
    //   },
    // },
  })

  // Node SDK expõe o helper:
  // - output_text: string quando response_format = "text"
  // Para json_schema, a lib já retorna JSON em resp.output[0].content[0].text (varia por versão).
  // Abaixo tentamos caminhos comuns e fazemos fallback para parse de string:
  const raw =
    (resp as any)?.output?.[0]?.content?.[0]?.text ??
    (resp as any)?.output_text ??
    (resp as any)?.output?.[0]?.content?.[0]?.json ??
    null

  if (!raw) throw new Error("OpenAI response parsing failed")

  const parsed: SummarizeOutput = typeof raw === "string" ? JSON.parse(raw) : raw
  return parsed
}

function merge(results: SummarizeOutput[]): SummarizeOutput {
  if (results.length === 1) return results[0]
  return {
    summary: results.map((r) => r.summary).join("\n\n"),
    key_points: results.flatMap((r) => r.key_points),
    action_items: results.flatMap((r) => r.action_items),
    warnings: results.flatMap((r) => r.warnings),
  }
}

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
    const model = MODEL_PREFS.find(Boolean)!

    // 1) sumariza cada chunk (map)
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

    // 2) consolida (reduce)
    const merged = merge(partials)

    // 3) opcional: segunda passada pedindo um "executive summary" dos parciais
    // (descomente se quiser polir)
    /*
    const polished = await summarizeChunk(model, JSON.stringify(merged), language);
    return NextResponse.json(polished);
    */

    return NextResponse.json(merged)
  } catch (e: any) {
    return NextResponse.json({ error: "Summarize endpoint failed", details: e?.message ?? String(e) }, { status: 500 })
  }
}
