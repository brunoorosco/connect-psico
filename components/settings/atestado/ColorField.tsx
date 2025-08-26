import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import * as React from "react"

type Props = {
  label: string
  value: string // espera #RRGGBB ou #RRGGBBAA
  onChange: (next: string) => void
  description?: string
  disabled?: boolean
}

function normalizeHex(hex: string) {
  let v = hex.trim()
  if (!v.startsWith("#")) v = `#${v}`
  // aceita #RGB, #RRGGBB, #RRGGBBAA -> normaliza maiúsculo
  const ok = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)
  return ok ? v.toUpperCase() : hex // se inválido, retorna original
}

// extrai só #RRGGBB para o <input type="color"> (não suporta alfa)
function hexForPicker(hex: string) {
  const m6 = /^#([0-9A-F]{6})$/i.exec(hex)
  const m8 = /^#([0-9A-F]{8})$/i.exec(hex)
  if (m6) return `#${m6[1]}`
  if (m8) return `#${m8[1].slice(0, 6)}`
  const m3 = /^#([0-9A-F]{3})$/i.exec(hex)
  if (m3) {
    // expande #RGB -> #RRGGBB
    const [r, g, b] = m3[1].split("")
    return `#${r}${r}${g}${g}${b}${b}`
  }
  // fallback seguro (preto) se vazio/ruim
  return "#000000"
}

export default function ColorField({ label, value, onChange, description, disabled }: Props) {
  const [text, setText] = React.useState(value || "#000000")

  React.useEffect(() => {
    setText(value || "#000000")
  }, [value])

  const handleTextBlur = () => {
    const normalized = normalizeHex(text)
    setText(normalized)
    onChange(normalized)
  }

  return (
    <div className="space-y-2.5">
      <Label className="block">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex items-center gap-2">
        {/* Picker */}
        <Input
          disabled={disabled}
          type="color"
          value={hexForPicker(text)}
          onChange={(e) => {
            // mantém alfa se houver; troca apenas os 6 primeiros dígitos
            const current = text.startsWith("#") ? text : `#${text}`
            const hasAlpha8 = /^#[0-9A-F]{8}$/i.test(current)
            const next6 = e.target.value.toUpperCase() // #RRGGBB
            const next = hasAlpha8 ? `${next6}${current.slice(7, 9)}` : next6
            setText(next)
            onChange(next)
          }}
          className="w-12 p-1 min-w-12"
        />

        {/* Campo para copiar/colar o hex */}
        <Input
          disabled={disabled}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextBlur}
          placeholder="#RRGGBB ou #RRGGBBAA"
          className="font-mono h-9"
        />
      </div>
    </div>
  )
}
