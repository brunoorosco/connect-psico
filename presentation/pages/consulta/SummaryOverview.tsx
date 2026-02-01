type Props = {
  text: string
}

export function SummaryOverview({ text }: Props) {
  return (
    <div className="rounded-xl border p-5 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Resumo da Sessão</h2>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </div>
  )
}
