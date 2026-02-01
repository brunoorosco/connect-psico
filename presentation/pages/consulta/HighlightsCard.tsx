type HighlightsProps = {
  title: string
  items: string[]
  variant: "positive" | "negative"
}

export function HighlightsCard({ title, items, variant }: HighlightsProps) {
  const styles =
    variant === "positive" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 list-disc list-inside">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
