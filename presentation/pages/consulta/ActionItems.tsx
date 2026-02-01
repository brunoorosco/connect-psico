type ActionItemsProps = {
  items: string[]
}

export function ActionItems({ items }: ActionItemsProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold mb-3 text-blue-900">Próximos Passos</h3>
      <ul className="space-y-2 list-disc list-inside text-blue-800">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
