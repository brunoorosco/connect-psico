// services/summarize.ts
export type SummaryResult = {
    summary: string;
    key_points: string[];
    action_items: string[];
    warnings: string[];
  };
  
  export async function summarizeAllText(args: {
    text: string;
    language?: string; // "pt-BR" padrão
  }) {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Summarization failed");
    }
    return data as SummaryResult;
  }
  