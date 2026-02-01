import { SummaryOverview } from "./SummaryOverview"
import { HighlightsCard } from "./HighlightsCard"
import { ActionItems } from "./ActionItems"
import { Alerts } from "./Alerts"

// types/summary.ts
export type SummaryDTO = {
  overview: string
  highlights: {
    positives: string[]
    negatives: string[]
  }
  next_steps: string[]
  alerts: string[]
}

type Props = {
  summary: SummaryDTO
}

export function SessionSummary({ summary }: Props) {
  return (
    <div className="space-y-6">
      <SummaryOverview text={summary.overview} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HighlightsCard title="Pontos Positivos" items={summary.highlights?.positives} variant="positive" />

        <HighlightsCard title="Pontos Negativos" items={summary.highlights?.negatives} variant="negative" />
      </div>

      <ActionItems items={summary.next_steps} />
      <Alerts items={summary.alerts} />
    </div>
  )
}
