type AlertsProps = {
  items: string[]
}

export function Alerts({ items }: AlertsProps) {
  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <h3 className="font-semibold mb-3 text-yellow-900">Pontos de Atenção</h3>
      <ul className="space-y-2 list-disc list-inside text-yellow-800">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
