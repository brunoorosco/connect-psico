import * as React from "react"
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui"
import { headerFontStacks } from "./constants"

// Tipagem do componente
type ModelFontProps = {
  value: string | undefined
  onChange: (fontKey: string) => void
  label?: string
  id?: string
  className?: string
  placeholder?: string
}

export default function ModelFont({
  value,
  onChange,
  label = "Modelo de Fonte",
  id,
  className,
  placeholder = "Selecione uma fonte",
}: ModelFontProps) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Elegante (Serif) */}
          <SelectGroup>
            <SelectLabel>Elegante (Serif)</SelectLabel>
            <SelectItem value="times" style={{ fontFamily: headerFontStacks.times }}>
              Times New Roman
            </SelectItem>
            <SelectItem value="georgia" style={{ fontFamily: headerFontStacks.georgia }}>
              Georgia
            </SelectItem>
            <SelectItem value="garamond" style={{ fontFamily: headerFontStacks.garamond }}>
              Garamond
            </SelectItem>
            <SelectItem value="baskerville" style={{ fontFamily: headerFontStacks.baskerville }}>
              Baskerville
            </SelectItem>
            <SelectItem value="cambria" style={{ fontFamily: headerFontStacks.cambria }}>
              Cambria
            </SelectItem>
          </SelectGroup>

          {/* Clássica (Sans-Serif) */}
          <SelectGroup>
            <SelectLabel>Clássica (Sans-Serif)</SelectLabel>
            <SelectItem value="inter" style={{ fontFamily: headerFontStacks.inter }}>
              Inter / System Sans
            </SelectItem>
            <SelectItem value="arial" style={{ fontFamily: headerFontStacks.arial }}>
              Arial / Helvetica
            </SelectItem>
            <SelectItem value="verdana" style={{ fontFamily: headerFontStacks.verdana }}>
              Verdana
            </SelectItem>
            <SelectItem value="tahoma" style={{ fontFamily: headerFontStacks.tahoma }}>
              Tahoma
            </SelectItem>
            <SelectItem value="trebuchet" style={{ fontFamily: headerFontStacks.trebuchet }}>
              Trebuchet MS
            </SelectItem>
          </SelectGroup>

          {/* Impacto (Display) */}
          <SelectGroup>
            <SelectLabel>Impacto (Display)</SelectLabel>
            <SelectItem value="impact" style={{ fontFamily: headerFontStacks.impact }}>
              Impact
            </SelectItem>
            <SelectItem value="copperplate" style={{ fontFamily: headerFontStacks.copperplate }}>
              Copperplate
            </SelectItem>
          </SelectGroup>

          {/* Assinatura (Cursive) */}
          <SelectGroup>
            <SelectLabel>Assinatura (Cursive)</SelectLabel>
            <SelectItem value="brush" style={{ fontFamily: headerFontStacks.brush }}>
              Brush Script MT
            </SelectItem>
            <SelectItem value="lucida" style={{ fontFamily: headerFontStacks.lucida }}>
              Lucida Handwriting
            </SelectItem>
          </SelectGroup>

          {/* Técnica (Monospace) */}
          <SelectGroup>
            <SelectLabel>Técnica (Monospace)</SelectLabel>
            <SelectItem value="courier" style={{ fontFamily: headerFontStacks.courier }}>
              Courier New
            </SelectItem>
            <SelectItem value="consolas" style={{ fontFamily: headerFontStacks.consolas }}>
              Consolas
            </SelectItem>
            <SelectItem value="monospace" style={{ fontFamily: headerFontStacks.monospace }}>
              Monospace
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
