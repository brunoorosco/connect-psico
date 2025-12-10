import { inngest } from "../client";
import { minio } from "@/infra/minio/config";
import axios, { AxiosResponse } from "axios";
import OpenAI from "openai";
import { notifyConsultationProcessed } from "@/services/socket-notifier";

// Types derived from existing routes
type GroqSuccess = {
    text?: string;
    segments?: unknown[];
    x_groq?: { id?: string } | Record<string, unknown>;
};

type SummarizeOutput = {
    summary: string;
    key_points: string[];
    action_items: string[];
    warnings: string[];
};

// Configs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const MODEL_PREFS = [
    "gpt-5-mini",
    "gpt-4.1-mini",
    "gpt-4o-mini",
];

function stripEdgeQuotes(url: string) {
    return url.trim().replace(/^['"]+|['"]+$/g, "");
}

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

    const resp = await openai.responses.create({
        model,
        input: `${sys}\n\n=== TEXTO ===\n${text}`,
    })

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

export const processConsultationTranscription = inngest.createFunction(
    { id: "process-consultation-transcription" },
    { event: "app/transcription.start" },
    async ({ event, step }) => {
        const { key, sessionId, language = "pt", response_format = "json", userId, text } = event.data;

        const transcription = await step.run("Get/Transcribe Text", async () => {
            if (text) return text;
            if (!key) throw new Error("No key or text provided");

            // 1. Get Presigned URL
            const rawUrl = await minio.presignedGetObject("recordings", key, 600);
            const presignedGet = stripEdgeQuotes(String(rawUrl));

            // 2. Call Groq
            const res = await axios.post<GroqSuccess>(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                {
                    model: "whisper-large-v3-turbo",
                    url: presignedGet,
                    language,
                    response_format,
                    temperature: 0,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return res.data.text || "";
        });

        const summary = await step.run("Summarize Text", async () => {
            if (!transcription || !transcription.trim()) {
                return {
                    summary: "",
                    key_points: [],
                    action_items: [],
                    warnings: []
                };
            }

            const chunks = chunkByChars(transcription.trim(), 12000);
            const partials: SummarizeOutput[] = [];

            for (const ck of chunks) {
                let lastErr: any;
                for (const m of MODEL_PREFS) {
                    try {
                        partials.push(await summarizeChunk(m, ck, "pt-BR"));
                        lastErr = null;
                        break;
                    } catch (e) {
                        lastErr = e;
                        continue;
                    }
                }
                if (lastErr) throw lastErr;
            }

            return merge(partials);
        });

        await step.run("Notify Frontend", async () => {
            await notifyConsultationProcessed(sessionId, {
                text: transcription,
                summary: summary,
            }, userId);
        });

        return { success: true, sessionId };
    }
);
