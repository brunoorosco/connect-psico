// components/forms/parts/CheckboxGroup.tsx
import { Control, useController } from "react-hook-form"

type Option = { key: string; label: string }
type Props = {
  name: string
  control: Control<any>
  options: Option[]
  columns?: number
}
export function CheckboxGroup({ name, control, options, columns = 2 }: Props) {
  const { field } = useController({ name, control })
  const value = field.value || {}
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${columns} gap-2`}>
      {options.map(o => {
        const checked = Boolean(value[o.key])
        return (
          <label key={o.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={checked}
              onChange={() => field.onChange({ ...value, [o.key]: !checked })}
            />
            <span className="text-sm">{o.label}</span>
          </label>
        )
      })}
    </div>
  )
}
